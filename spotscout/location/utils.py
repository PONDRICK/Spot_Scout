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
from .models import Location, BusinessOwnerCount
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

current_directory = os.path.dirname(os.path.abspath(__file__))

# Set the correct paths for the model and label encoder
model_path = os.path.join(current_directory, 'spot_scout_model', 'trained_model_100_v.2.pkl')
encoder_path = os.path.join(current_directory, 'spot_scout_model', 'label_encoder_100_v.2.pkl')

# Load the trained model and label encoder
rf_classifier = joblib.load(model_path)
label_encoder = joblib.load(encoder_path)
# Ensure this matches the 
feature_order = [
    'lat', 'lon', 'province', 'distance_nearest_bank', 'distance_nearest_fuel', 
    'distance_nearest_police', 'distance_nearest_bus_stop', 'distance_nearest_hospital', 
    'distance_nearest_atm', 'distance_nearest_station', 'population',
    'distance_nearest_category: Food', 'distance_nearest_category: Drink_and_Bar', 
    'distance_nearest_category: Education', 'distance_nearest_category: Health', 
    'distance_nearest_category: Residential', 'distance_nearest_category: Service',
    'distance_nearest_category: Hotel', 'distance_nearest_category: Convenience', 
    'distance_nearest_category: Buying_Place', 'distance_nearest_category: Other',
    'count_500m_Food', 'count_1000m_Food', 'count_500m_Drink_and_Bar',
    'count_1000m_Drink_and_Bar', 'count_500m_Education', 'count_1000m_Education', 
    'count_500m_Health', 'count_1000m_Health', 'count_500m_Residential', 
    'count_1000m_Residential', 'count_500m_Service', 'count_1000m_Service',
    'count_500m_Hotel', 'count_1000m_Hotel', 'count_500m_Convenience',
    'count_1000m_Convenience', 'count_500m_Buying_Place', 'count_1000m_Buying_Place', 
    'count_500m_Other', 'count_1000m_Other', 'District_TH', 'Subdistrict_TH'
]

def predict_amenity_category(user_location):
    # Prepare the test data in the correct structure
    test_data = {
        'lat': [user_location.lat],
        'lon': [user_location.lon],
        'province': [user_location.province],
        'distance_nearest_bank': [user_location.distance_nearest_bank],
        'distance_nearest_fuel': [user_location.distance_nearest_fuel],
        'distance_nearest_police': [user_location.distance_nearest_police],
        'distance_nearest_bus_stop': [user_location.distance_nearest_bus_stop],
        'distance_nearest_hospital': [user_location.distance_nearest_hospital],
        'distance_nearest_atm': [user_location.distance_nearest_atm],
        'distance_nearest_station': [user_location.distance_nearest_station],
        'population': [user_location.population],
        'distance_nearest_category: Food': [user_location.distance_nearest_food],
        'distance_nearest_category: Drink_and_Bar': [user_location.distance_nearest_drink_and_bar],
        'distance_nearest_category: Education': [user_location.distance_nearest_education],
        'distance_nearest_category: Health': [user_location.distance_nearest_health],
        'distance_nearest_category: Residential': [user_location.distance_nearest_residential],
        'distance_nearest_category: Service': [user_location.distance_nearest_service],
        'distance_nearest_category: Hotel': [user_location.distance_nearest_hotel],
        'distance_nearest_category: Convenience': [user_location.distance_nearest_convenience],
        'distance_nearest_category: Buying_Place': [user_location.distance_nearest_buying_place],
        'distance_nearest_category: Other': [user_location.distance_nearest_other],
        'count_500m_Food': [user_location.count_500m_food],
        'count_1000m_Food': [user_location.count_1000m_food],
        'count_500m_Drink_and_Bar': [user_location.count_500m_drink_and_bar],
        'count_1000m_Drink_and_Bar': [user_location.count_1000m_drink_and_bar],
        'count_500m_Education': [user_location.count_500m_education],
        'count_1000m_Education': [user_location.count_1000m_education],
        'count_500m_Health': [user_location.count_500m_health],
        'count_1000m_Health': [user_location.count_1000m_health],
        'count_500m_Residential': [user_location.count_500m_residential],
        'count_1000m_Residential': [user_location.count_1000m_residential],
        'count_500m_Service': [user_location.count_500m_service],
        'count_1000m_Service': [user_location.count_1000m_service],
        'count_500m_Hotel': [user_location.count_500m_hotel],
        'count_1000m_Hotel': [user_location.count_1000m_hotel],
        'count_500m_Convenience': [user_location.count_500m_convenience],
        'count_1000m_Convenience': [user_location.count_1000m_convenience],
        'count_500m_Buying_Place': [user_location.count_500m_buying_place],
        'count_1000m_Buying_Place': [user_location.count_1000m_buying_place],
        'count_500m_Other': [user_location.count_500m_other],
        'count_1000m_Other': [user_location.count_1000m_other],
        'District_TH': [user_location.district_th],
        'Subdistrict_TH': [user_location.subdistrict_th]
    }
    
    # Handle any missing features by assigning default values
    missing_features = list(set(feature_order) - set(test_data.keys()))
    for feature in missing_features:
        if feature.startswith('count_'):
            test_data[feature] = [0]  # Default for missing count is 0
        elif feature.startswith('distance_'):
            test_data[feature] = [float('inf')]  # Default for missing distances is infinity

    # Create DataFrame for model prediction
    test_df = pd.DataFrame(test_data)

    # Ensure the 'province', 'District_TH', and 'Subdistrict_TH' columns have all possible labels before transforming
    all_possible_labels = np.append(label_encoder.classes_, [user_location.province, user_location.district_th, user_location.subdistrict_th])
    label_encoder.classes_ = np.unique(all_possible_labels)

    # Encode the 'province', 'District_TH', and 'Subdistrict_TH' using the label encoder
    for col in ['province', 'District_TH', 'Subdistrict_TH']:
        test_df[col] = label_encoder.transform(test_df[col])

    # Replace infinite values with 0, as the model might not handle infinity properly
    test_df.replace([np.inf, -np.inf], 0, inplace=True)

    # Ensure the columns are in the correct order
    test_df = test_df[feature_order]

    # Use the random forest classifier to predict the probabilities
    predicted_probabilities = rf_classifier.predict_proba(test_df)[0]

    # Get top predictions by probability
    top_indices = np.argsort(predicted_probabilities)[::-1]
    top_labels = label_encoder.inverse_transform(top_indices)
    top_scores = predicted_probabilities[top_indices]

    # Return a list of ranked predictions
    ranked_predictions = [{"category": label, "score": score} for label, score in zip(top_labels, top_scores)]
    
    # Return the top-ranked prediction
    top_ranked_prediction = ranked_predictions[0]

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
    # Query data from Location model for the specific category
    locations = Location.objects.filter(category=category).values('lat', 'lon')
    df = pd.DataFrame(locations)

    if df.empty:
        return None  # Return None if no locations are found for the category

    # Get the coordinates for the specific category
    category_coords = df[['lat', 'lon']].values.astype(float)

    # Build the KDTree for the category coordinates
    tree = KDTree(category_coords)

    # Find the nearest two distances to the given lat/lon point
    point = [[float(lat), float(lon)]]
    dist, ind = tree.query(point, k=2)

    # Check if the closest point is the same as the input point
    closest_point = category_coords[ind[0][0]]
    if closest_point[0] == float(lat) and closest_point[1] == float(lon):
        # If the nearest point is itself, return the second nearest point
        nearest_distance = dist[0][1] * 111319.9  # Convert degrees to meters
    else:
        # Otherwise, return the nearest point
        nearest_distance = dist[0][0] * 111319.9  # Convert degrees to meters

    return nearest_distance

def calculate_nearest_category(lat, lon, category):
    return calculate_distance_category(lat, lon, category)  # Reuse the KDTree-based function

def calculate_count_category(lat, lon, category, radius):
    # Query data from Location model for the specific category
    locations = Location.objects.filter(category=category).values('lat', 'lon')
    df = pd.DataFrame(locations)

    if df.empty:
        return 0  # Return 0 if no locations are found for the category

    # Get the coordinates for the specific category
    category_coords = df[['lat', 'lon']].values.astype(float)

    # Build the KDTree for the category coordinates
    tree = KDTree(category_coords)

    # Convert radius from meters to degrees
    radius_in_degrees = float(radius) / 111319.9

    # Define the point (lat, lon) to query around
    point = [[float(lat), float(lon)]]

    # Query the tree to find neighbors within the radius
    indices = tree.query_radius(point, r=radius_in_degrees)

    # Get the neighbors found within the radius
    neighbors = category_coords[indices[0]]

    # Remove the point itself if it's in the result by checking if it's exactly the same
    neighbors = [n for n in neighbors if not (n[0] == lat and n[1] == lon)]

    # Return the count of found neighbors excluding the point itself
    return len(neighbors)

# Wrappers for 500m and 1000m
def calculate_count_category_500m(lat, lon, category):
    return calculate_count_category(lat, lon, category, 500)

def calculate_count_category_1000m(lat, lon, category):
    return calculate_count_category(lat, lon, category, 1000)
