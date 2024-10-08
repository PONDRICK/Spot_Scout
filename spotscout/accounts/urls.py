from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    GetOTPExpirationView, RegisterUserView, VerifyUserEmail, LoginUserView, TestAuthenticationView,
    PasswordResetConfirm, PasswordResetRequestView, SetNewPassword, LogoutUserView, ResendOTPView,
    AdminUserListView, AdminUserDetailView, AdminRoleListView, AdminRoleDetailView,
    AdminLogoutUserView, AdminSystemConfigView, AdminActivityLogView, AdminUserDeleteView,
    BanUserView,UnbanUserView,SendOTPView,VerifyOTPView
)

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('verify-email/<str:token>/', VerifyUserEmail.as_view(), name='verify'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('profile/', TestAuthenticationView.as_view(), name='granted'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirm.as_view(), name='reset-password-confirm'),
    path('set-new-password/', SetNewPassword.as_view(), name='set-new-password'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    # Admin URLs
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/delete/', AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path('roles/', AdminRoleListView.as_view(), name='admin-role-list'),
    path('roles/<int:pk>/', AdminRoleDetailView.as_view(), name='admin-role-detail'),
    path('logout/<int:pk>/', AdminLogoutUserView.as_view(), name='admin-logout-user'),
    path('system-config/', AdminSystemConfigView.as_view(), name='admin-system-config'),
    path('activity-logs/', AdminActivityLogView.as_view(), name='admin-activity-logs'),
    path('ban-user/', BanUserView.as_view(), name='ban-user'),
    path('unban-user/', UnbanUserView.as_view(), name='unban-user'),
    path('get-otp-expiration/', GetOTPExpirationView.as_view(), name='get-otp-expiration'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
]