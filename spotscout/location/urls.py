from django.urls import path
from .views import LocationDetailView ,AddUserLocationView, NearestPlaceView, CountAmenityView, PopulationView

urlpatterns = [
    path('add-location/', AddUserLocationView.as_view(), name='add-location'),
    path('nearest_place/', NearestPlaceView.as_view(), name='nearest_place'),
    path('count_amenities/', CountAmenityView.as_view(), name='count_amenities'),
    path('population/', PopulationView.as_view(), name='population'),
    path('location-details/', LocationDetailView.as_view(), name='location-details'),
]