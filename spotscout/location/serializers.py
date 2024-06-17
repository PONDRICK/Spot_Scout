from rest_framework import serializers
from .models import UserLocation

class UserLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLocation
        fields = [
            'id', 'user', 'lat', 'lon', 'province', 'ISO3166_2',
            'distance_nearest_bank', 'count_bank_within_500m',
            'distance_nearest_fuel', 'count_fuel_within_500m',
            'distance_nearest_office', 'count_office_within_500m',
            'distance_nearest_police', 'count_police_within_500m',
            'distance_nearest_townhall', 'count_townhall_within_500m',
            'distance_nearest_bus_station', 'count_bus_station_within_500m',
            'distance_nearest_bus_stop', 'count_bus_stop_within_500m',
            'distance_nearest_convenience', 'count_convenience_within_500m',
            'distance_nearest_mall', 'count_mall_within_500m',
            'distance_nearest_supermarket', 'count_supermarket_within_500m',
            'distance_nearest_books', 'count_books_within_500m',
            'distance_nearest_coffee', 'count_coffee_within_500m',
            'distance_nearest_department_store', 'count_department_store_within_500m',
            'distance_nearest_clothes', 'count_clothes_within_500m',
            'distance_nearest_bakery', 'count_bakery_within_500m',
            'distance_nearest_cafe', 'count_cafe_within_500m',
            'population'
        ]
