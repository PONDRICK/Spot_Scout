from django.urls import path
from .views import CalculateCountCategoryView, CalculateDistanceCategoryView, LocationDetailView ,AddUserLocationView, NearestPlaceView, CountAmenityView, PopulationView

urlpatterns = [
    path('add-location/', AddUserLocationView.as_view(), name='add-location'),
    path('nearest_place/', NearestPlaceView.as_view(), name='nearest_place'),
    path('count_amenities/', CountAmenityView.as_view(), name='count_amenities'),
    path('population/', PopulationView.as_view(), name='population'),
    path('location-details/', LocationDetailView.as_view(), name='location-details'),
    path('calculate-distance-category/', CalculateDistanceCategoryView.as_view(), name='calculate_distance_category'),
    path('calculate-count-category/', CalculateCountCategoryView.as_view(), name='calculate_count_category'),

]