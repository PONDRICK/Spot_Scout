from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserLocation
from .utils import calculate_nearest_place, count_amenities_within_500m, get_province_and_iso, get_population
from rest_framework.permissions import IsAuthenticated

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
            population=population
        )

        return Response({"message": "Location added successfully"}, status=status.HTTP_201_CREATED)
