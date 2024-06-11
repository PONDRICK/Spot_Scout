from django.urls import path
from .views import RegisterUserView, VerifyUserEmail, LoginUserView, TestAuthenticationView, PasswordResetConfirm, PasswordResetRequestView, SetNewPassword, LogoutUserView,ResendOTPView

urlpatterns = [
    path('register/',RegisterUserView.as_view(),name='register'),
    path('verify-email/',VerifyUserEmail.as_view(),name='verify'),
    path('login/', LoginUserView.as_view(),name='login'),
    path('profile/',TestAuthenticationView.as_view(),name='granted'),
    path('password-reset/', PasswordResetRequestView.as_view(),name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirm.as_view(), name='reset-password-confirm'),
    path('set-new-password/', SetNewPassword.as_view(),name='set-new-password'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),

]
