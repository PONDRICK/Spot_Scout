from rest_framework import serializers
from .models import UserLocation

class UserLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLocation
        fields = [
            'id', 'user', 'lat', 'lon', 'province', 'ISO3166_2',
            'distance_nearest_bank', 'distance_nearest_fuel', 'distance_nearest_police', 'distance_nearest_bus_stop',
            'distance_nearest_hospital', 'distance_nearest_atm', 'distance_nearest_station', 'population',
            'distance_nearest_food', 'distance_nearest_drink_and_bar', 'distance_nearest_education',
            'distance_nearest_health', 'distance_nearest_residential', 'distance_nearest_service',
            'distance_nearest_hotel', 'distance_nearest_convenience', 'distance_nearest_buying_place',
            'distance_nearest_other', 'count_500m_food', 'count_1000m_food', 'count_500m_drink_and_bar',
            'count_1000m_drink_and_bar', 'count_500m_education', 'count_1000m_education', 'count_500m_health',
            'count_1000m_health', 'count_500m_residential', 'count_1000m_residential', 'count_500m_service',
            'count_1000m_service', 'count_500m_hotel', 'count_1000m_hotel', 'count_500m_convenience',
            'count_1000m_convenience', 'count_500m_buying_place', 'count_1000m_buying_place', 'count_500m_other',
            'count_1000m_other', 'district_th', 'subdistrict_th', 'predicted_amenity_category'
        ]
