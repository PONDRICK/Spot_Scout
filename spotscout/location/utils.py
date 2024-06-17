import osmnx as ox
import networkx as nx
import requests
from geopy.distance import geodesic
from .models import Location

def calculate_nearest_place(latitude, longitude, amenity):
    node_coords = (latitude, longitude)
    locations = Location.objects.filter(amenity=amenity)
    min_distance = float('inf')  # Initialize with infinity
    nearest_place = None
    
    for location in locations:
        place_coords = (location.lat, location.lon)
        place_distance = geodesic(node_coords, place_coords).meters
        
        if place_distance < min_distance:
            min_distance = place_distance
            nearest_place = location
    
    if nearest_place is not None:
        return min_distance, nearest_place.province
    else:
        return None, None

def count_amenities_within_500m(latitude, longitude, amenity):
    node_coords = (latitude, longitude)
    count = 0  # Initialize count
    locations = Location.objects.filter(amenity=amenity)
    
    for location in locations:
        place_coords = (location.lat, location.lon)
        place_distance = geodesic(node_coords, place_coords).meters
        if place_distance <= 500:
            count += 1
    return count

def get_province_and_iso(lat, lon):
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    is_in({lat},{lon});
    area._[admin_level=4];
    out;
    """
    response = requests.get(overpass_url, params={'data': overpass_query})
    data = response.json()

    # Extracting the area id
    area_id = data['elements'][0]['id']

    # Querying the area information
    area_query = f"""
    [out:json];
    area({area_id});
    out;
    """
    response = requests.get(overpass_url, params={'data': area_query})
    area_data = response.json()

    # Extracting the province name and ISO3166-2 code
    province_name = None
    iso_code = None
    for element in area_data['elements']:
        if 'tags' in element:
            if 'name' in element['tags']:
                province_name = element['tags']['name']
            if 'ISO3166-2' in element['tags']:
                iso_code = element['tags']['ISO3166-2']
            if province_name and iso_code:
                break

    return province_name, iso_code

def get_population(lat, lon, distance):
    try:
        lat = float(lat)
        lon = float(lon)
        G = ox.graph_from_point((lat, lon), dist=distance, network_type='all', simplify=False)
        stats = ox.basic_stats(G)
        return stats['n']
    except (nx.NetworkXPointlessConcept, ValueError, TypeError) as e:
        print(f"Error processing point ({lat}, {lon}): {e}")
        return 0
