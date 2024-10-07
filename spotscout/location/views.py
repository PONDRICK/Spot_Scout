import osmnx as ox
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserLocation
from .utils import calculate_count_category, calculate_count_category_1000m, calculate_count_category_500m,calculate_distance_category, calculate_nearest_category,find_location ,calculate_nearest_place, count_amenities_within_500m, get_province_and_iso, get_population, predict_amenity_category
from rest_framework.permissions import IsAuthenticated
from geopy.distance import geodesic
from .models import Location, BusinessOwnerCount, AverageIncome, ClosedBusinessCount


class AddUserLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        lat = request.data.get('lat')
        lon = request.data.get('lon')
        province, ISO3166_2 = get_province_and_iso(lat, lon)

        # Calculate distances and counts for new categories
        categories = [
            'Food', 'Drink_and_Bar', 'Education', 'Health', 'Residential', 
            'Service', 'Hotel', 'Convenience', 'Buying_Place', 'Other'
        ]
        distances = {}
        counts_500m = {}
        counts_1000m = {}

        for category in categories:
            distances[category] = calculate_nearest_category(lat, lon, category)
            counts_500m[category] = calculate_count_category_500m(lat, lon, category)
            counts_1000m[category] = calculate_count_category_1000m(lat, lon, category)

        # Calculate distances for specific amenities
        distance_nearest_bank, _ = calculate_nearest_place(lat, lon, 'bank')
        distance_nearest_fuel, _ = calculate_nearest_place(lat, lon, 'fuel')
        distance_nearest_police, _ = calculate_nearest_place(lat, lon, 'police')
        distance_nearest_bus_stop, _ = calculate_nearest_place(lat, lon, 'bus_stop')
        distance_nearest_hospital, _ = calculate_nearest_place(lat, lon, 'hospital')
        distance_nearest_atm, _ = calculate_nearest_place(lat, lon, 'atm')
        distance_nearest_station, _ = calculate_nearest_place(lat, lon, 'station')
        
        population = get_population(lat, lon, 500)  # Population within 500 meters

        location_details = find_location(lat, lon)
        if location_details:
            district_th = location_details.get('district_th')
            subdistrict_th = location_details.get('subdistrict_th')
        else:
            district_th = None
            subdistrict_th = None
        # Create the user location object with all required fields
        user_location = UserLocation.objects.create(
            user=user,
            lat=lat,
            lon=lon,
            province=province,
            ISO3166_2=ISO3166_2,
            distance_nearest_bank=distance_nearest_bank,
            distance_nearest_fuel=distance_nearest_fuel,
            distance_nearest_police=distance_nearest_police,
            distance_nearest_bus_stop=distance_nearest_bus_stop,
            distance_nearest_hospital=distance_nearest_hospital,
            distance_nearest_atm=distance_nearest_atm,
            distance_nearest_station=distance_nearest_station,
            population=population,
            # Category distances
            distance_nearest_food=distances['Food'],
            distance_nearest_drink_and_bar=distances['Drink_and_Bar'],
            distance_nearest_education=distances['Education'],
            distance_nearest_health=distances['Health'],
            distance_nearest_residential=distances['Residential'],
            distance_nearest_service=distances['Service'],
            distance_nearest_hotel=distances['Hotel'],
            distance_nearest_convenience=distances['Convenience'],
            distance_nearest_buying_place=distances['Buying_Place'],
            distance_nearest_other=distances['Other'],
            # Category counts for 500m
            count_500m_food=counts_500m['Food'],
            count_500m_drink_and_bar=counts_500m['Drink_and_Bar'],
            count_500m_education=counts_500m['Education'],
            count_500m_health=counts_500m['Health'],
            count_500m_residential=counts_500m['Residential'],
            count_500m_service=counts_500m['Service'],
            count_500m_hotel=counts_500m['Hotel'],
            count_500m_convenience=counts_500m['Convenience'],
            count_500m_buying_place=counts_500m['Buying_Place'],
            count_500m_other=counts_500m['Other'],
            # Category counts for 1000m
            count_1000m_food=counts_1000m['Food'],
            count_1000m_drink_and_bar=counts_1000m['Drink_and_Bar'],
            count_1000m_education=counts_1000m['Education'],
            count_1000m_health=counts_1000m['Health'],
            count_1000m_residential=counts_1000m['Residential'],
            count_1000m_service=counts_1000m['Service'],
            count_1000m_hotel=counts_1000m['Hotel'],
            count_1000m_convenience=counts_1000m['Convenience'],
            count_1000m_buying_place=counts_1000m['Buying_Place'],
            count_1000m_other=counts_1000m['Other'],
            district_th=district_th,
            subdistrict_th=subdistrict_th
        )

        # Predict the amenity category using the trained model
        ranked_predictions, top_ranked_prediction = predict_amenity_category(user_location)
        user_location.predicted_amenity_category = top_ranked_prediction["category"]
        user_location.save()

        return Response({
            "message": "Location added successfully", 
            "ranked_predictions": ranked_predictions
        }, status=status.HTTP_201_CREATED)
    
class NearestPlaceView(APIView):
    def get(self, request):
        latitude = request.GET.get('lat')
        longitude = request.GET.get('lon')
        amenity = request.GET.get('amenity')

        if not latitude or not longitude or not amenity:
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except ValueError:
            return Response({"error": "Invalid latitude or longitude"}, status=status.HTTP_400_BAD_REQUEST)

        node_coords = (latitude, longitude)
        places = Location.objects.filter(amenity=amenity)
        min_distance = float('inf')
        nearest_place = None

        for place in places:
            place_coords = (place.lat, place.lon)
            place_distance = geodesic(node_coords, place_coords).meters
            if place_distance < min_distance:
                min_distance = place_distance
                nearest_place = place

        if nearest_place:
            output = {
                "distance": min_distance,
                "amenity": amenity,
                "province": nearest_place.province,
                "lat": nearest_place.lat,
                "lon": nearest_place.lon
            }
        else:
            output = {"message": f"No {amenity} found nearby."}

        return Response(output, status=status.HTTP_200_OK)
    

class CountAmenityView(APIView):
    def get(self, request):  # Change post to get
        latitude = request.GET.get('lat')
        longitude = request.GET.get('lon')
        amenity = request.GET.get('amenity')
        distance = request.GET.get('distance')

        if not latitude or not longitude or not amenity or not distance:
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            latitude = float(latitude)
            longitude = float(longitude)
            distance = float(distance)
        except ValueError:
            return Response({"error": "Invalid latitude, longitude, or distance"}, status=status.HTTP_400_BAD_REQUEST)

        node_coords = (latitude, longitude)
        count = 0  # Initialize count
        locations = Location.objects.filter(amenity=amenity)
        
        location_coords = []  # Collect lat/lon for matched locations

        for location in locations:
            place_coords = (location.lat, location.lon)
            place_distance = geodesic(node_coords, place_coords).meters
            if place_distance <= distance:
                count += 1
                location_coords.append({"lat": location.lat, "lon": location.lon})

        return Response({"count": count, "amenity": amenity, "distance": distance, "locations": location_coords}, status=status.HTTP_200_OK)
    
class PopulationView(APIView):
    def get(self, request):
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')
        distance = request.GET.get('distance')

        if not lat or not lon or not distance:
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(lat)
            lon = float(lon)
            distance = float(distance)
        except ValueError:
            return Response({"error": "Invalid latitude, longitude, or distance"}, status=status.HTTP_400_BAD_REQUEST)

        population = get_population(lat, lon, distance)
        return Response({"population": population}, status=status.HTTP_200_OK)

class LocationDetailView(APIView):
    def get(self, request):
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')

        if not lat or not lon:
            return Response({"error": "Missing latitude or longitude"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            return Response({"error": "Invalid latitude or longitude format"}, status=status.HTTP_400_BAD_REQUEST)

        location_details = find_location(lat, lon)

        if location_details:
            subdistrict = location_details.get("subdistrict_th")
            district = location_details.get("district_th")
            province = location_details.get("province_th")  # Get province in Thai

            # Fetch the business owner count
            business_count = BusinessOwnerCount.objects.filter(
                subdistrict=subdistrict,
                district=district
            ).first()
            business_count_data = business_count.count if business_count else 0
            location_details["business_count"] = business_count_data

            # Fetch the average income for the province
            average_income = AverageIncome.objects.filter(
                province=province
            ).first()
            average_income_value = average_income.value if average_income else None
            location_details["average_income"] = average_income_value

            # Fetch the closed businesses count
            closed_business = ClosedBusinessCount.objects.filter(
                subdistrict=subdistrict,
                district=district
            ).first()
            closed_business_count = closed_business.count if closed_business else 0
            location_details["closed_business_count"] = closed_business_count

            return Response(location_details, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Location not found"}, status=status.HTTP_404_NOT_FOUND)
        
class CalculateDistanceCategoryView(APIView):
    def get(self, request):
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')
        category = request.GET.get('category')

        # Check if lat, lon, and category are provided
        if not lat or not lon or not category:
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            return Response({"error": "Invalid latitude or longitude format"}, status=status.HTTP_400_BAD_REQUEST)

        # Call the calculate_distance_category function with correct parameters
        nearest_distance = calculate_distance_category(lat, lon, category)

        if nearest_distance is None:
            return Response({"message": f"No locations found for category: {category}"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"distance": nearest_distance, "category": category}, status=status.HTTP_200_OK)


class CalculateCountCategoryView(APIView):
    def get(self, request):
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')
        category = request.GET.get('category')
        radius = request.GET.get('radius')

        # Check if all parameters are provided
        if not lat or not lon or not category or not radius:
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(lat)
            lon = float(lon)
            radius = float(radius)
        except ValueError:
            return Response({"error": "Invalid latitude, longitude, or radius format"}, status=status.HTTP_400_BAD_REQUEST)

        # Call the calculate_count_category function
        count = calculate_count_category(lat, lon, category, radius)

        if count is None:
            return Response({"message": f"No locations found for category: {category}"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"count": count, "category": category, "radius": radius}, status=status.HTTP_200_OK)

    
class LocationLookupView(APIView):
    def get(self, request):
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')

        if not lat or not lon:
            return Response({"error": "Missing latitude or longitude"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            return Response({"error": "Invalid latitude or longitude format"}, status=status.HTTP_400_BAD_REQUEST)

        location_details = find_location(lat, lon)

        if location_details:
            return Response(location_details, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Location not found"}, status=status.HTTP_404_NOT_FOUND)
