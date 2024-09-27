import osmnx as ox
import networkx as nx
import requests
import joblib
import pandas as pd
import numpy as np
import geopandas as gpd
import os
from shapely.geometry import Point 
from geopy.distance import geodesic
from .models import Location, BusinessOwnerCount, LocationCategory
from sklearn.neighbors import KDTree
import csv

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

rf_classifier = joblib.load('../spotscout/location/spot_scout_model/random_forest_model.pkl')
label_encoder = joblib.load('../spotscout/location/spot_scout_model/label_encoder.pkl')

feature_order = [
    'lat', 'lon', 'province', 'distance_nearest_bank', 'distance_nearest_fuel', 
    'distance_nearest_office', 'distance_nearest_police', 'distance_nearest_townhall',
    'distance_nearest_bus_station', 'distance_nearest_bus_stop', 'distance_nearest_convenience',
    'distance_nearest_mall', 'distance_nearest_supermarket', 'distance_nearest_books',
    'distance_nearest_coffee', 'distance_nearest_department_store', 'distance_nearest_clothes',
    'distance_nearest_bakery', 'distance_nearest_cafe', 'count_bank_within_500m',
    'count_fuel_within_500m', 'count_office_within_500m', 'count_police_within_500m',
    'count_townhall_within_500m', 'count_bus_station_within_500m', 'count_bus_stop_within_500m',
    'count_convenience_within_500m', 'count_mall_within_500m', 'count_supermarket_within_500m',
    'count_books_within_500m', 'count_coffee_within_500m', 'count_department_store_within_500m',
    'count_clothes_within_500m', 'count_bakery_within_500m', 'count_cafe_within_500m',
    'count_viewpoint_within_500m', 'count_attraction_within_500m', 'count_camp_site_within_500m',
    'count_guest_house_within_500m', 'count_information_within_500m', 'count_museum_within_500m',
    'count_zoo_within_500m', 'count_picnic_site_within_500m', 'count_hotel_within_500m',
    'count_motel_within_500m', 'count_chalet_within_500m', 'count_artwork_within_500m',
    'count_wilderness_hut_within_500m', 'count_waterfall_within_500m', 'distance_nearest_restaurant',
    'distance_nearest_fast_food', 'distance_nearest_village', 'distance_nearest_hospital',
    'distance_nearest_pharmacy', 'distance_nearest_clinic', 'distance_nearest_hotel',
    'distance_nearest_apartment', 'distance_nearest_atm', 'distance_nearest_traffic_signals',
    'distance_nearest_station', 'distance_nearest_school', 'distance_nearest_motorway_junction',
    'distance_nearest_crossing', 'distance_nearest_viewpoint', 'distance_nearest_attraction',
    'distance_nearest_camp_site', 'distance_nearest_guest_house', 'distance_nearest_information',
    'distance_nearest_museum', 'distance_nearest_zoo', 'distance_nearest_picnic_site',
    'distance_nearest_motel', 'distance_nearest_chalet', 'distance_nearest_artwork',
    'distance_nearest_wilderness_hut', 'distance_nearest_waterfall', 'count_restaurant_within_500m',
    'count_fast_food_within_500m', 'count_village_within_500m', 'count_hospital_within_500m',
    'count_pharmacy_within_500m', 'count_clinic_within_500m', 'count_apartment_within_500m',
    'count_atm_within_500m', 'count_traffic_signals_within_500m', 'count_station_within_500m',
    'count_school_within_500m', 'count_motorway_junction_within_500m', 'count_crossing_within_500m',
    'population'
]

def predict_amenity_category(user_location):
    test_data = {
        'lat': [user_location.lat],
        'lon': [user_location.lon],
        'province': [user_location.province],
        'distance_nearest_bank': [user_location.distance_nearest_bank],
        'distance_nearest_fuel': [user_location.distance_nearest_fuel],
        'distance_nearest_office': [user_location.distance_nearest_office],
        'distance_nearest_police': [user_location.distance_nearest_police],
        'distance_nearest_townhall': [user_location.distance_nearest_townhall],
        'distance_nearest_bus_station': [user_location.distance_nearest_bus_station],
        'distance_nearest_bus_stop': [user_location.distance_nearest_bus_stop],
        'distance_nearest_convenience': [user_location.distance_nearest_convenience],
        'distance_nearest_mall': [user_location.distance_nearest_mall],
        'distance_nearest_supermarket': [user_location.distance_nearest_supermarket],
        'distance_nearest_books': [user_location.distance_nearest_books],
        'distance_nearest_coffee': [user_location.distance_nearest_coffee],
        'distance_nearest_department_store': [user_location.distance_nearest_department_store],
        'distance_nearest_clothes': [user_location.distance_nearest_clothes],
        'distance_nearest_bakery': [user_location.distance_nearest_bakery],
        'distance_nearest_cafe': [user_location.distance_nearest_cafe],
        'distance_nearest_restaurant': [user_location.distance_nearest_restaurant],
        'distance_nearest_fast_food': [user_location.distance_nearest_fast_food],
        'distance_nearest_village': [user_location.distance_nearest_village],
        'distance_nearest_hospital': [user_location.distance_nearest_hospital],
        'distance_nearest_pharmacy': [user_location.distance_nearest_pharmacy],
        'distance_nearest_clinic': [user_location.distance_nearest_clinic],
        'distance_nearest_hotel': [user_location.distance_nearest_hotel],
        'distance_nearest_apartment': [user_location.distance_nearest_apartment],
        'distance_nearest_atm': [user_location.distance_nearest_atm],
        'distance_nearest_traffic_signals': [user_location.distance_nearest_traffic_signals],
        'distance_nearest_station': [user_location.distance_nearest_station],
        'distance_nearest_school': [user_location.distance_nearest_school],
        'distance_nearest_motorway_junction': [user_location.distance_nearest_motorway_junction],
        'distance_nearest_crossing': [user_location.distance_nearest_crossing],
        'distance_nearest_viewpoint': [user_location.distance_nearest_viewpoint],
        'distance_nearest_attraction': [user_location.distance_nearest_attraction],
        'distance_nearest_camp_site': [user_location.distance_nearest_camp_site],
        'distance_nearest_guest_house': [user_location.distance_nearest_guest_house],
        'distance_nearest_information': [user_location.distance_nearest_information],
        'distance_nearest_museum': [user_location.distance_nearest_museum],
        'distance_nearest_zoo': [user_location.distance_nearest_zoo],
        'distance_nearest_picnic_site': [user_location.distance_nearest_picnic_site],
        'distance_nearest_motel': [user_location.distance_nearest_motel],
        'distance_nearest_chalet': [user_location.distance_nearest_chalet],
        'distance_nearest_artwork': [user_location.distance_nearest_artwork],
        'distance_nearest_wilderness_hut': [user_location.distance_nearest_wilderness_hut],
        'distance_nearest_waterfall': [user_location.distance_nearest_waterfall],
        'count_bank_within_500m': [user_location.count_bank_within_500m],
        'count_fuel_within_500m': [user_location.count_fuel_within_500m],
        'count_office_within_500m': [user_location.count_office_within_500m],
        'count_police_within_500m': [user_location.count_police_within_500m],
        'count_townhall_within_500m': [user_location.count_townhall_within_500m],
        'count_bus_station_within_500m': [user_location.count_bus_station_within_500m],
        'count_bus_stop_within_500m': [user_location.count_bus_stop_within_500m],
        'count_convenience_within_500m': [user_location.count_convenience_within_500m],
        'count_mall_within_500m': [user_location.count_mall_within_500m],
        'count_supermarket_within_500m': [user_location.count_supermarket_within_500m],
        'count_books_within_500m': [user_location.count_books_within_500m],
        'count_coffee_within_500m': [user_location.count_coffee_within_500m],
        'count_department_store_within_500m': [user_location.count_department_store_within_500m],
        'count_clothes_within_500m': [user_location.count_clothes_within_500m],
        'count_bakery_within_500m': [user_location.count_bakery_within_500m],
        'count_cafe_within_500m': [user_location.count_cafe_within_500m],
        'count_restaurant_within_500m': [user_location.count_restaurant_within_500m],
        'count_fast_food_within_500m': [user_location.count_fast_food_within_500m],
        'count_village_within_500m': [user_location.count_village_within_500m],
        'count_hospital_within_500m': [user_location.count_hospital_within_500m],
        'count_pharmacy_within_500m': [user_location.count_pharmacy_within_500m],
        'count_clinic_within_500m': [user_location.count_clinic_within_500m],
        'count_hotel_within_500m': [user_location.count_hotel_within_500m],
        'count_apartment_within_500m': [user_location.count_apartment_within_500m],
        'count_atm_within_500m': [user_location.count_atm_within_500m],
        'count_traffic_signals_within_500m': [user_location.count_traffic_signals_within_500m],
        'count_station_within_500m': [user_location.count_station_within_500m],
        'count_school_within_500m': [user_location.count_school_within_500m],
        'count_motorway_junction_within_500m': [user_location.count_motorway_junction_within_500m],
        'count_crossing_within_500m': [user_location.count_crossing_within_500m],
        'population': [user_location.population]
    }

    # Add missing features with default values
    missing_features = list(set(feature_order) - set(test_data.keys()))
    for feature in missing_features:
        if feature.startswith('count_'):
            test_data[feature] = [0]
        elif feature.startswith('distance_'):
            test_data[feature] = [float('inf')]

    test_df = pd.DataFrame(test_data)

    # Ensure the 'province' column has all possible labels before transforming
    all_possible_labels = np.append(label_encoder.classes_, user_location.province)
    label_encoder.classes_ = np.unique(all_possible_labels)

    # Convert 'province' using the same label encoder used during training
    test_df['province'] = label_encoder.transform(test_df['province'])

    # Handle missing values and replace infinite values
    test_df.replace([np.inf, -np.inf], 0, inplace=True)

    # Reorder test_df to match the feature order
    test_df = test_df[feature_order]

    # Predict the amenity category using the trained model
    predicted_probabilities = rf_classifier.predict_proba(test_df)[0]

    # Convert the numeric predictions back to the original labels
    top_indices = np.argsort(predicted_probabilities)[::-1]
    top_labels = label_encoder.inverse_transform(top_indices)
    top_scores = predicted_probabilities[top_indices]

    ranked_predictions = [{"category": label, "score": score} for label, score in zip(top_labels, top_scores)]

    top_ranked_prediction = ranked_predictions[0]  # Get the top-ranked prediction

    return ranked_predictions, top_ranked_prediction

os.environ['SHAPE_RESTORE_SHX'] = 'YES'

# Load the shapefiles
subdistrict_shapefile_path = os.path.join(os.path.dirname(__file__), 'shapes', 'tha_admbnda_adm3_rtsd_20220121.shp')
district_shapefile_path = os.path.join(os.path.dirname(__file__), 'shapes', 'tha_admbnda_adm2_rtsd_20220121.shp')

gdf_subdistrict = gpd.read_file(subdistrict_shapefile_path)
gdf_district = gpd.read_file(district_shapefile_path)

# Function to find location based on latitude and longitude
def find_location(lat, lon):
    point = Point(lon, lat)  # Create a point from latitude and longitude
    
    # Find subdistrict that contains this point
    subdistrict = gdf_subdistrict[gdf_subdistrict.contains(point)]
    
    # Find district that contains this point
    district = gdf_district[gdf_district.contains(point)]
    
    if not subdistrict.empty and not district.empty:
        return {
            "subdistrict_en": subdistrict['ADM3_EN'].iloc[0],
            "subdistrict_th": subdistrict['ADM3_TH'].iloc[0],
            "district_en": district['ADM2_EN'].iloc[0],
            "district_th": district['ADM2_TH'].iloc[0],
            "province_en": district['ADM1_EN'].iloc[0],
            "province_th": district['ADM1_TH'].iloc[0],
        }
    else:
        return None
    
    
def calculate_distance_category(lat, lon, category):
    # Query data from LocationCategory model for the specific category
    locations = LocationCategory.objects.filter(category=category).values('lat', 'lon')
    df = pd.DataFrame(locations)

    if df.empty:
        return None  # Return None if no locations are found for the category

    # Get the coordinates for the specific category
    category_coords = df[['lat', 'lon']].values
    
    # Build the KDTree for the category coordinates
    tree = KDTree(category_coords)

    # Find the nearest two distances to the given lat/lon point
    point = [[lat, lon]]
    dist, ind = tree.query(point, k=2)  # k=2 to skip the point itself

    # If the closest point is the same as the input point, skip it
    nearest_distance = dist[0][1] if dist[0][0] == 0 else dist[0][0]

    return nearest_distance * 111319.9 

def calculate_count_category(lat, lon, category, radius):
    # Query data from LocationCategory model for the specific category
    locations = LocationCategory.objects.filter(category=category).values('lat', 'lon')
    df = pd.DataFrame(locations)

    if df.empty:
        return None  # Return None if no locations are found for the category

    # Get the coordinates for the specific category
    category_coords = df[['lat', 'lon']].values

    # Build the KDTree for the category coordinates
    tree = KDTree(category_coords)

    # Convert radius from meters to degrees
    radius_in_degrees = radius / 111319.9

    # Define the point (lat, lon) to query around
    point = [[lat, lon]]

    # Query the tree to find neighbors within the radius
    indices = tree.query_radius(point, r=radius_in_degrees)

    # Filter out the input point itself from the result
    count = 0
    for index in indices[0]:
        neighbor_lat = category_coords[index][0]
        neighbor_lon = category_coords[index][1]
        if not (abs(neighbor_lat - lat) < 1e-6 and abs(neighbor_lon - lon) < 1e-6):
            count += 1

    return count