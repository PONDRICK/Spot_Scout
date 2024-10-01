from django.db import models
from django.conf import settings

class Location(models.Model):
    # id field is automatically added by Django as an AutoField if not specified
    source_id = models.BigIntegerField(null=True, blank=True)
    name = models.CharField(max_length=255)
    lat = models.FloatField()
    lon = models.FloatField()
    amenity = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    category = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.amenity}"


class UserLocation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lat = models.FloatField()
    lon = models.FloatField()
    province = models.CharField(max_length=255, blank=True, null=True)
    ISO3166_2 = models.CharField(max_length=10, blank=True, null=True)
    distance_nearest_bank = models.FloatField(blank=True, null=True)
    distance_nearest_fuel = models.FloatField(blank=True, null=True)
    distance_nearest_office = models.FloatField(blank=True, null=True)
    distance_nearest_police = models.FloatField(blank=True, null=True)
    distance_nearest_townhall = models.FloatField(blank=True, null=True)
    distance_nearest_bus_station = models.FloatField(blank=True, null=True)
    distance_nearest_bus_stop = models.FloatField(blank=True, null=True)
    distance_nearest_convenience = models.FloatField(blank=True, null=True)
    distance_nearest_mall = models.FloatField(blank=True, null=True)
    distance_nearest_supermarket = models.FloatField(blank=True, null=True)
    distance_nearest_books = models.FloatField(blank=True, null=True)
    distance_nearest_coffee = models.FloatField(blank=True, null=True)
    distance_nearest_department_store = models.FloatField(blank=True, null=True)
    distance_nearest_clothes = models.FloatField(blank=True, null=True)
    distance_nearest_bakery = models.FloatField(blank=True, null=True)
    distance_nearest_cafe = models.FloatField(blank=True, null=True)
    distance_nearest_restaurant = models.FloatField(blank=True, null=True)
    distance_nearest_fast_food = models.FloatField(blank=True, null=True)
    distance_nearest_village = models.FloatField(blank=True, null=True)
    distance_nearest_hospital = models.FloatField(blank=True, null=True)
    distance_nearest_pharmacy = models.FloatField(blank=True, null=True)
    distance_nearest_clinic = models.FloatField(blank=True, null=True)
    distance_nearest_hotel = models.FloatField(blank=True, null=True)
    distance_nearest_apartment = models.FloatField(blank=True, null=True)
    distance_nearest_atm = models.FloatField(blank=True, null=True)
    distance_nearest_traffic_signals = models.FloatField(blank=True, null=True)
    distance_nearest_station = models.FloatField(blank=True, null=True)
    distance_nearest_school = models.FloatField(blank=True, null=True)
    distance_nearest_motorway_junction = models.FloatField(blank=True, null=True)
    distance_nearest_crossing = models.FloatField(blank=True, null=True)
    distance_nearest_viewpoint = models.FloatField(blank=True, null=True)
    distance_nearest_attraction = models.FloatField(blank=True, null=True)
    distance_nearest_camp_site = models.FloatField(blank=True, null=True)
    distance_nearest_guest_house = models.FloatField(blank=True, null=True)
    distance_nearest_information = models.FloatField(blank=True, null=True)
    distance_nearest_museum = models.FloatField(blank=True, null=True)
    distance_nearest_zoo = models.FloatField(blank=True, null=True)
    distance_nearest_picnic_site = models.FloatField(blank=True, null=True)
    distance_nearest_motel = models.FloatField(blank=True, null=True)
    distance_nearest_chalet = models.FloatField(blank=True, null=True)
    distance_nearest_artwork = models.FloatField(blank=True, null=True)
    distance_nearest_wilderness_hut = models.FloatField(blank=True, null=True)
    distance_nearest_waterfall = models.FloatField(blank=True, null=True)
    count_bank_within_500m = models.IntegerField(blank=True, null=True)
    count_fuel_within_500m = models.IntegerField(blank=True, null=True)
    count_office_within_500m = models.IntegerField(blank=True, null=True)
    count_police_within_500m = models.IntegerField(blank=True, null=True)
    count_townhall_within_500m = models.IntegerField(blank=True, null=True)
    count_bus_station_within_500m = models.IntegerField(blank=True, null=True)
    count_bus_stop_within_500m = models.IntegerField(blank=True, null=True)
    count_convenience_within_500m = models.IntegerField(blank=True, null=True)
    count_mall_within_500m = models.IntegerField(blank=True, null=True)
    count_supermarket_within_500m = models.IntegerField(blank=True, null=True)
    count_books_within_500m = models.IntegerField(blank=True, null=True)
    count_coffee_within_500m = models.IntegerField(blank=True, null=True)
    count_department_store_within_500m = models.IntegerField(blank=True, null=True)
    count_clothes_within_500m = models.IntegerField(blank=True, null=True)
    count_bakery_within_500m = models.IntegerField(blank=True, null=True)
    count_cafe_within_500m = models.IntegerField(blank=True, null=True)
    count_restaurant_within_500m = models.IntegerField(blank=True, null=True)
    count_fast_food_within_500m = models.IntegerField(blank=True, null=True)
    count_village_within_500m = models.IntegerField(blank=True, null=True)
    count_hospital_within_500m = models.IntegerField(blank=True, null=True)
    count_pharmacy_within_500m = models.IntegerField(blank=True, null=True)
    count_clinic_within_500m = models.IntegerField(blank=True, null=True)
    count_hotel_within_500m = models.IntegerField(blank=True, null=True)
    count_apartment_within_500m = models.IntegerField(blank=True, null=True)
    count_atm_within_500m = models.IntegerField(blank=True, null=True)
    count_traffic_signals_within_500m = models.IntegerField(blank=True, null=True)
    count_station_within_500m = models.IntegerField(blank=True, null=True)
    count_school_within_500m = models.IntegerField(blank=True, null=True)
    count_motorway_junction_within_500m = models.IntegerField(blank=True, null=True)
    count_crossing_within_500m = models.IntegerField(blank=True, null=True)
    count_viewpoint_within_500m = models.IntegerField(blank=True, null=True)
    count_attraction_within_500m = models.IntegerField(blank=True, null=True)
    count_camp_site_within_500m = models.IntegerField(blank=True, null=True)
    count_guest_house_within_500m = models.IntegerField(blank=True, null=True)
    count_information_within_500m = models.IntegerField(blank=True, null=True)
    count_museum_within_500m = models.IntegerField(blank=True, null=True)
    count_zoo_within_500m = models.IntegerField(blank=True, null=True)
    count_picnic_site_within_500m = models.IntegerField(blank=True, null=True)
    count_motel_within_500m = models.IntegerField(blank=True, null=True)
    count_chalet_within_500m = models.IntegerField(blank=True, null=True)
    count_artwork_within_500m = models.IntegerField(blank=True, null=True)
    count_wilderness_hut_within_500m = models.IntegerField(blank=True, null=True)
    count_waterfall_within_500m = models.IntegerField(blank=True, null=True)
    population = models.IntegerField(blank=True, null=True)
    predicted_amenity_category = models.CharField(max_length=255, blank=True, null=True)  # New field

    def __str__(self):
        return f"{self.user.email} - {self.lat}, {self.lon}"
    
class BusinessOwnerCount(models.Model):
    subdistrict = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    count = models.IntegerField()

    def __str__(self):
        return f"{self.subdistrict}, {self.district}, {self.province}: {self.count}"

class AverageIncome(models.Model):
    province = models.CharField(max_length=255)
    value = models.FloatField()

    def __str__(self):
        return f"{self.province}: {self.value}"

class ClosedBusinessCount(models.Model):
    subdistrict = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    count = models.IntegerField()

    def __str__(self):
        return f"{self.subdistrict}, {self.district}, {self.province}: {self.count}"
