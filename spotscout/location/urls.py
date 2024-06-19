from django.urls import path
from .views import AddUserLocationView,NearestPlaceView

urlpatterns = [
    path('add-location/', AddUserLocationView.as_view(), name='add-location'),
    path('nearest_place/', NearestPlaceView.as_view(), name='nearest_place'),
]