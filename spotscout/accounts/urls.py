from django.urls import path
from .views import (
    RegisterUserView, VerifyUserEmail, LoginUserView, TestAuthenticationView,
    PasswordResetConfirm, PasswordResetRequestView, SetNewPassword, LogoutUserView, ResendOTPView,
    AdminUserListView, AdminUserDetailView, AdminRoleListView, AdminRoleDetailView,
    AdminLogoutUserView, AdminSystemConfigView, AdminActivityLogView
)

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('verify-email/', VerifyUserEmail.as_view(), name='verify'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('profile/', TestAuthenticationView.as_view(), name='granted'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirm.as_view(), name='reset-password-confirm'),
    path('set-new-password/', SetNewPassword.as_view(), name='set-new-password'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),

    # Admin URLs
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/roles/', AdminRoleListView.as_view(), name='admin-role-list'),
    path('admin/roles/<int:pk>/', AdminRoleDetailView.as_view(), name='admin-role-detail'),
    path('admin/logout/<int:pk>/', AdminLogoutUserView.as_view(), name='admin-logout-user'),
    path('admin/system-config/', AdminSystemConfigView.as_view(), name='admin-system-config'),
    path('admin/activity-logs/', AdminActivityLogView.as_view(), name='admin-activity-logs'),
]
