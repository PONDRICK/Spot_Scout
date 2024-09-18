from django.urls import path
from .views import SaveUserMapView, GetUserMapsView, DeleteUserMapView

urlpatterns = [
    path('save_map/', SaveUserMapView.as_view(), name='save_map'),
    path('user_maps/', GetUserMapsView.as_view(), name='user_maps'),
    path('delete_map/<int:map_id>/', DeleteUserMapView.as_view(), name='delete_map'),
]