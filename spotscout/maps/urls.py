from django.urls import path
from .views import SaveUserMapView, GetUserMapsView

urlpatterns = [
    path('save_map/', SaveUserMapView.as_view(), name='save_map'),
    path('user_maps/', GetUserMapsView.as_view(), name='user_maps'),
]