import osmnx as ox
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserLocation
from .utils import calculate_count_category,calculate_distance_category,find_location ,calculate_nearest_place, count_amenities_within_500m, get_province_and_iso, get_population, predict_amenity_category
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

        # Calculate distances and counts
        distance_nearest_bank, _ = calculate_nearest_place(lat, lon, 'bank')
        count_bank_within_500m = count_amenities_within_500m(lat, lon, 'bank')

        distance_nearest_fuel, _ = calculate_nearest_place(lat, lon, 'fuel')
        count_fuel_within_500m = count_amenities_within_500m(lat, lon, 'fuel')

        distance_nearest_office, _ = calculate_nearest_place(lat, lon, 'office')
        count_office_within_500m = count_amenities_within_500m(lat, lon, 'office')

        distance_nearest_police, _ = calculate_nearest_place(lat, lon, 'police')
        count_police_within_500m = count_amenities_within_500m(lat, lon, 'police')

        distance_nearest_townhall, _ = calculate_nearest_place(lat, lon, 'townhall')
        count_townhall_within_500m = count_amenities_within_500m(lat, lon, 'townhall')

        distance_nearest_bus_station, _ = calculate_nearest_place(lat, lon, 'bus_station')
        count_bus_station_within_500m = count_amenities_within_500m(lat, lon, 'bus_station')

        distance_nearest_bus_stop, _ = calculate_nearest_place(lat, lon, 'bus_stop')
        count_bus_stop_within_500m = count_amenities_within_500m(lat, lon, 'bus_stop')

        distance_nearest_convenience, _ = calculate_nearest_place(lat, lon, 'convenience')
        count_convenience_within_500m = count_amenities_within_500m(lat, lon, 'convenience')

        distance_nearest_mall, _ = calculate_nearest_place(lat, lon, 'mall')
        count_mall_within_500m = count_amenities_within_500m(lat, lon, 'mall')

        distance_nearest_supermarket, _ = calculate_nearest_place(lat, lon, 'supermarket')
        count_supermarket_within_500m = count_amenities_within_500m(lat, lon, 'supermarket')

        distance_nearest_books, _ = calculate_nearest_place(lat, lon, 'books')
        count_books_within_500m = count_amenities_within_500m(lat, lon, 'books')

        distance_nearest_coffee, _ = calculate_nearest_place(lat, lon, 'coffee')
        count_coffee_within_500m = count_amenities_within_500m(lat, lon, 'coffee')

        distance_nearest_department_store, _ = calculate_nearest_place(lat, lon, 'department_store')
        count_department_store_within_500m = count_amenities_within_500m(lat, lon, 'department_store')

        distance_nearest_clothes, _ = calculate_nearest_place(lat, lon, 'clothes')
        count_clothes_within_500m = count_amenities_within_500m(lat, lon, 'clothes')

        distance_nearest_bakery, _ = calculate_nearest_place(lat, lon, 'bakery')
        count_bakery_within_500m = count_amenities_within_500m(lat, lon, 'bakery')

        distance_nearest_cafe, _ = calculate_nearest_place(lat, lon, 'cafe')
        count_cafe_within_500m = count_amenities_within_500m(lat, lon, 'cafe')

        # Calculate additional distances and counts
        distance_nearest_restaurant, _ = calculate_nearest_place(lat, lon, 'restaurant')
        count_restaurant_within_500m = count_amenities_within_500m(lat, lon, 'restaurant')

        distance_nearest_fast_food, _ = calculate_nearest_place(lat, lon, 'fast_food')
        count_fast_food_within_500m = count_amenities_within_500m(lat, lon, 'fast_food')

        distance_nearest_village, _ = calculate_nearest_place(lat, lon, 'village')
        count_village_within_500m = count_amenities_within_500m(lat, lon, 'village')

        distance_nearest_hospital, _ = calculate_nearest_place(lat, lon, 'hospital')
        count_hospital_within_500m = count_amenities_within_500m(lat, lon, 'hospital')

        distance_nearest_pharmacy, _ = calculate_nearest_place(lat, lon, 'pharmacy')
        count_pharmacy_within_500m = count_amenities_within_500m(lat, lon, 'pharmacy')

        distance_nearest_clinic, _ = calculate_nearest_place(lat, lon, 'clinic')
        count_clinic_within_500m = count_amenities_within_500m(lat, lon, 'clinic')

        distance_nearest_hotel, _ = calculate_nearest_place(lat, lon, 'hotel')
        count_hotel_within_500m = count_amenities_within_500m(lat, lon, 'hotel')

        distance_nearest_apartment, _ = calculate_nearest_place(lat, lon, 'apartment')
        count_apartment_within_500m = count_amenities_within_500m(lat, lon, 'apartment')

        distance_nearest_atm, _ = calculate_nearest_place(lat, lon, 'atm')
        count_atm_within_500m = count_amenities_within_500m(lat, lon, 'atm')

        distance_nearest_traffic_signals, _ = calculate_nearest_place(lat, lon, 'traffic_signals')
        count_traffic_signals_within_500m = count_amenities_within_500m(lat, lon, 'traffic_signals')

        distance_nearest_station, _ = calculate_nearest_place(lat, lon, 'station')
        count_station_within_500m = count_amenities_within_500m(lat, lon, 'station')

        distance_nearest_school, _ = calculate_nearest_place(lat, lon, 'school')
        count_school_within_500m = count_amenities_within_500m(lat, lon, 'school')

        distance_nearest_motorway_junction, _ = calculate_nearest_place(lat, lon, 'motorway_junction')
        count_motorway_junction_within_500m = count_amenities_within_500m(lat, lon, 'motorway_junction')

        distance_nearest_crossing, _ = calculate_nearest_place(lat, lon, 'crossing')
        count_crossing_within_500m = count_amenities_within_500m(lat, lon, 'crossing')

        distance_nearest_viewpoint, _ = calculate_nearest_place(lat, lon, 'viewpoint')
        count_viewpoint_within_500m = count_amenities_within_500m(lat, lon, 'viewpoint')

        distance_nearest_attraction, _ = calculate_nearest_place(lat, lon, 'attraction')
        count_attraction_within_500m = count_amenities_within_500m(lat, lon, 'attraction')

        distance_nearest_camp_site, _ = calculate_nearest_place(lat, lon, 'camp_site')
        count_camp_site_within_500m = count_amenities_within_500m(lat, lon, 'camp_site')

        distance_nearest_guest_house, _ = calculate_nearest_place(lat, lon, 'guest_house')
        count_guest_house_within_500m = count_amenities_within_500m(lat, lon, 'guest_house')

        distance_nearest_information, _ = calculate_nearest_place(lat, lon, 'information')
        count_information_within_500m = count_amenities_within_500m(lat, lon, 'information')

        distance_nearest_museum, _ = calculate_nearest_place(lat, lon, 'museum')
        count_museum_within_500m = count_amenities_within_500m(lat, lon, 'museum')

        distance_nearest_zoo, _ = calculate_nearest_place(lat, lon, 'zoo')
        count_zoo_within_500m = count_amenities_within_500m(lat, lon, 'zoo')

        distance_nearest_picnic_site, _ = calculate_nearest_place(lat, lon, 'picnic_site')
        count_picnic_site_within_500m = count_amenities_within_500m(lat, lon, 'picnic_site')

        distance_nearest_motel, _ = calculate_nearest_place(lat, lon, 'motel')
        count_motel_within_500m = count_amenities_within_500m(lat, lon, 'motel')

        distance_nearest_chalet, _ = calculate_nearest_place(lat, lon, 'chalet')
        count_chalet_within_500m = count_amenities_within_500m(lat, lon, 'chalet')

        distance_nearest_artwork, _ = calculate_nearest_place(lat, lon, 'artwork')
        count_artwork_within_500m = count_amenities_within_500m(lat, lon, 'artwork')

        distance_nearest_wilderness_hut, _ = calculate_nearest_place(lat, lon, 'wilderness_hut')
        count_wilderness_hut_within_500m = count_amenities_within_500m(lat, lon, 'wilderness_hut')

        distance_nearest_waterfall, _ = calculate_nearest_place(lat, lon, 'waterfall')
        count_waterfall_within_500m = count_amenities_within_500m(lat, lon, 'waterfall')

        population = get_population(lat, lon, 500)  # Calculate population within 500 meters

        user_location = UserLocation.objects.create(
            user=user,
            lat=lat,
            lon=lon,
            province=province,
            ISO3166_2=ISO3166_2,
            distance_nearest_bank=distance_nearest_bank,
            count_bank_within_500m=count_bank_within_500m,
            distance_nearest_fuel=distance_nearest_fuel,
            count_fuel_within_500m=count_fuel_within_500m,
            distance_nearest_office=distance_nearest_office,
            count_office_within_500m=count_office_within_500m,
            distance_nearest_police=distance_nearest_police,
            count_police_within_500m=count_police_within_500m,
            distance_nearest_townhall=distance_nearest_townhall,
            count_townhall_within_500m=count_townhall_within_500m,
            distance_nearest_bus_station=distance_nearest_bus_station,
            count_bus_station_within_500m=count_bus_station_within_500m,
            distance_nearest_bus_stop=distance_nearest_bus_stop,
            count_bus_stop_within_500m=count_bus_stop_within_500m,
            distance_nearest_convenience=distance_nearest_convenience,
            count_convenience_within_500m=count_convenience_within_500m,
            distance_nearest_mall=distance_nearest_mall,
            count_mall_within_500m=count_mall_within_500m,
            distance_nearest_supermarket=distance_nearest_supermarket,
            count_supermarket_within_500m=count_supermarket_within_500m,
            distance_nearest_books=distance_nearest_books,
            count_books_within_500m=count_books_within_500m,
            distance_nearest_coffee=distance_nearest_coffee,
            count_coffee_within_500m=count_coffee_within_500m,
            distance_nearest_department_store=distance_nearest_department_store,
            count_department_store_within_500m=count_department_store_within_500m,
            distance_nearest_clothes=distance_nearest_clothes,
            count_clothes_within_500m=count_clothes_within_500m,
            distance_nearest_bakery=distance_nearest_bakery,
            count_bakery_within_500m=count_bakery_within_500m,
            distance_nearest_cafe=distance_nearest_cafe,
            count_cafe_within_500m=count_cafe_within_500m,
            distance_nearest_restaurant=distance_nearest_restaurant,
            count_restaurant_within_500m=count_restaurant_within_500m,
            distance_nearest_fast_food=distance_nearest_fast_food,
            count_fast_food_within_500m=count_fast_food_within_500m,
            distance_nearest_village=distance_nearest_village,
            count_village_within_500m=count_village_within_500m,
            distance_nearest_hospital=distance_nearest_hospital,
            count_hospital_within_500m=count_hospital_within_500m,
            distance_nearest_pharmacy=distance_nearest_pharmacy,
            count_pharmacy_within_500m=count_pharmacy_within_500m,
            distance_nearest_clinic=distance_nearest_clinic,
            count_clinic_within_500m=count_clinic_within_500m,
            distance_nearest_hotel=distance_nearest_hotel,
            count_hotel_within_500m=count_hotel_within_500m,
            distance_nearest_apartment=distance_nearest_apartment,
            count_apartment_within_500m=count_apartment_within_500m,
            distance_nearest_atm=distance_nearest_atm,
            count_atm_within_500m=count_atm_within_500m,
            distance_nearest_traffic_signals=distance_nearest_traffic_signals,
            count_traffic_signals_within_500m=count_traffic_signals_within_500m,
            distance_nearest_station=distance_nearest_station,
            count_station_within_500m=count_station_within_500m,
            distance_nearest_school=distance_nearest_school,
            count_school_within_500m=count_school_within_500m,
            distance_nearest_motorway_junction=distance_nearest_motorway_junction,
            count_motorway_junction_within_500m=count_motorway_junction_within_500m,
            distance_nearest_crossing=distance_nearest_crossing,
            count_crossing_within_500m=count_crossing_within_500m,
            distance_nearest_viewpoint=distance_nearest_viewpoint,
            count_viewpoint_within_500m=count_viewpoint_within_500m,
            distance_nearest_attraction=distance_nearest_attraction,
            count_attraction_within_500m=count_attraction_within_500m,
            distance_nearest_camp_site=distance_nearest_camp_site,
            count_camp_site_within_500m=count_camp_site_within_500m,
            distance_nearest_guest_house=distance_nearest_guest_house,
            count_guest_house_within_500m=count_guest_house_within_500m,
            distance_nearest_information=distance_nearest_information,
            count_information_within_500m=count_information_within_500m,
            distance_nearest_museum=distance_nearest_museum,
            count_museum_within_500m=count_museum_within_500m,
            distance_nearest_zoo=distance_nearest_zoo,
            count_zoo_within_500m=count_zoo_within_500m,
            distance_nearest_picnic_site=distance_nearest_picnic_site,
            count_picnic_site_within_500m=count_picnic_site_within_500m,
            distance_nearest_motel=distance_nearest_motel,
            count_motel_within_500m=count_motel_within_500m,
            distance_nearest_chalet=distance_nearest_chalet,
            count_chalet_within_500m=count_chalet_within_500m,
            distance_nearest_artwork=distance_nearest_artwork,
            count_artwork_within_500m=count_artwork_within_500m,
            distance_nearest_wilderness_hut=distance_nearest_wilderness_hut,
            count_wilderness_hut_within_500m=count_wilderness_hut_within_500m,
            distance_nearest_waterfall=distance_nearest_waterfall,
            count_waterfall_within_500m=count_waterfall_within_500m,
            population=population
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
