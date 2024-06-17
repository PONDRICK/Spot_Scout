from django.urls import path
from .views import AddUserLocationView

urlpatterns = [
    path('add-location/', AddUserLocationView.as_view(), name='add-location'),
]
