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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Correct usage of AUTH_USER_MODEL
    lat = models.FloatField()
    lon = models.FloatField()
    province = models.CharField(max_length=100)
    ISO3166_2 = models.CharField(max_length=10)

    # Amenity distances
    distance_nearest_bank = models.FloatField(null=True, blank=True)
    distance_nearest_fuel = models.FloatField(null=True, blank=True)
    distance_nearest_police = models.FloatField(null=True, blank=True)
    distance_nearest_bus_stop = models.FloatField(null=True, blank=True)
    distance_nearest_hospital = models.FloatField(null=True, blank=True)
    distance_nearest_atm = models.FloatField(null=True, blank=True)
    distance_nearest_station = models.FloatField(null=True, blank=True)

    # Population
    population = models.IntegerField(null=True, blank=True)

    # Distances for new categories
    distance_nearest_food = models.FloatField(null=True, blank=True)
    distance_nearest_drink_and_bar = models.FloatField(null=True, blank=True)
    distance_nearest_education = models.FloatField(null=True, blank=True)
    distance_nearest_health = models.FloatField(null=True, blank=True)
    distance_nearest_residential = models.FloatField(null=True, blank=True)
    distance_nearest_service = models.FloatField(null=True, blank=True)
    distance_nearest_hotel = models.FloatField(null=True, blank=True)
    distance_nearest_convenience = models.FloatField(null=True, blank=True)
    distance_nearest_buying_place = models.FloatField(null=True, blank=True)
    distance_nearest_other = models.FloatField(null=True, blank=True)

    # Count amenities within 500m and 1000m
    count_500m_food = models.IntegerField(null=True, blank=True)
    count_1000m_food = models.IntegerField(null=True, blank=True)
    count_500m_drink_and_bar = models.IntegerField(null=True, blank=True)
    count_1000m_drink_and_bar = models.IntegerField(null=True, blank=True)
    count_500m_education = models.IntegerField(null=True, blank=True)
    count_1000m_education = models.IntegerField(null=True, blank=True)
    count_500m_health = models.IntegerField(null=True, blank=True)
    count_1000m_health = models.IntegerField(null=True, blank=True)
    count_500m_residential = models.IntegerField(null=True, blank=True)
    count_1000m_residential = models.IntegerField(null=True, blank=True)
    count_500m_service = models.IntegerField(null=True, blank=True)
    count_1000m_service = models.IntegerField(null=True, blank=True)
    count_500m_hotel = models.IntegerField(null=True, blank=True)
    count_1000m_hotel = models.IntegerField(null=True, blank=True)
    count_500m_convenience = models.IntegerField(null=True, blank=True)
    count_1000m_convenience = models.IntegerField(null=True, blank=True)
    count_500m_buying_place = models.IntegerField(null=True, blank=True)
    count_1000m_buying_place = models.IntegerField(null=True, blank=True)
    count_500m_other = models.IntegerField(null=True, blank=True)
    count_1000m_other = models.IntegerField(null=True, blank=True)

    # Thai district and subdistrict fields
    district_th = models.CharField(max_length=255, null=True, blank=True)
    subdistrict_th = models.CharField(max_length=255, null=True, blank=True)

    # Prediction results
    predicted_amenity_category = models.CharField(max_length=100, null=True, blank=True)   
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
