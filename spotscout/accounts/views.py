import pytz
from django.shortcuts import render
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveUpdateDestroyAPIView, UpdateAPIView,DestroyAPIView
from .serializers import UserRegisterSerializer,ActivityLogSerializer ,LoginSerializer, PasswordResetRequestSerializer, SetNewPasswordSerializer, LogoutUserSerializer,UserSerializer, RoleSerializer, PermissionSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .utils import send_code_to_user,log_activity,generate_verification_token
from .models import OneTimePassword, User, ActivityLog
from django.contrib.auth.models import Permission
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str , DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.http import HttpResponse
from django.core.management import call_command
from datetime import datetime
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.exceptions import AuthenticationFailed
import json
import logging
import jwt
from django.utils import timezone
from spotscout import settings
from rest_framework_simplejwt.settings import api_settings
from jwt.exceptions import ExpiredSignatureError




logger = logging.getLogger(__name__)

# Create your views here.
class AdminUserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        log_activity(request.user, "viewed_users")
        return response

class AdminUserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class AdminRoleListView(ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class AdminRoleDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class AdminLogoutUserView(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, *args, **kwargs):
        user = self.get_object()
        try:
            refresh = RefreshToken.for_user(user)
            refresh.blacklist()
            log_activity(self.request.user, f"logged_out_user {user.email}")
            return Response({"detail": "User logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
class AdminSystemConfigView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, *args, **kwargs):
        config_data = request.data.get("config")
        with open("system_config.json", "w") as config_file:
            json.dump(config_data, config_file)
        return Response({"detail": "System configuration updated successfully"}, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        with open("system_config.json", "r") as config_file:
            config_data = json.load(config_file)
        return Response({"config": config_data}, status=status.HTTP_200_OK)

class AdminActivityLogView(ListAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class AdminUserDeleteView(DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def perform_destroy(self, instance):
        user_email = instance.email
        instance.delete()
        # Log the activity
        log_activity(self.request.user, f"deleted_user {user_email}")

class BanUserView(GenericAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")
        try:
            user = User.objects.get(id=user_id)
            user.is_banned = True
            user.is_online = False  # Force logout if currently logged in
            user.save()
            log_activity(request.user, f"banned_user {user.email}")
            return Response({"message": "User has been banned successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
class UnbanUserView(GenericAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")
        try:
            user = User.objects.get(id=user_id)
            user.is_banned = False
            user.save()
            log_activity(request.user, f"unbanned_user {user.email}")
            return Response({"message": "User has been unbanned successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
class RegisterUserView(GenericAPIView):
    serializer_class = UserRegisterSerializer

    def post(self, request):
        user_data = request.data
        serializer = self.serializer_class(data=user_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            otp_code, expiration_time, token = send_code_to_user(user.email)
            log_activity(user, "registered")
            return Response({
                'data': serializer.data,
                'message': 'Thanks for signing up!',
                'expiration_time': expiration_time,
                'token': token  # Include the token in the response
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyUserEmail(GenericAPIView):
    def post(self, request, token):
        otpcode = request.data.get('otp')
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'], email=payload['email'])
            user_code_obj = OneTimePassword.objects.get(user=user, code=otpcode)

            if user_code_obj.expires_at < timezone.now():
                return Response({'message': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

            if not user.is_verified:
                user.is_verified = True
                user.save()
                log_activity(user, "verified_email")
                return Response({
                    'message': 'Account email verified successfully'
                }, status=status.HTTP_200_OK)

            return Response({
                'message': 'Code is invalid, user already verified'
            }, status=status.HTTP_204_NO_CONTENT)

        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist, OneTimePassword.DoesNotExist):
            return Response({'message': 'Invalid token or OTP'}, status=status.HTTP_400_BAD_REQUEST)        

class LoginUserView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        if user.is_banned:
            raise AuthenticationFailed("This account has been banned.")
        user.is_online = True
        user.save()
        log_activity(user, "logged_in")
        return Response(serializer.data, status=status.HTTP_200_OK)
class TestAuthenticationView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data={
            'msg' : 'its works'
        }
        return Response(data,status.HTTP_200_OK)
    

class PasswordResetRequestView(GenericAPIView):
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            user = User.objects.get(email=serializer.validated_data['email'])
            log_activity(user, "requested_password_reset")
            return Response({'message': 'A link has been sent to your email to reset your password'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PasswordResetConfirm(GenericAPIView):

    def get(self, request, uidb64, token):
        try:
            user_id=smart_str(urlsafe_base64_decode(uidb64))
            user=User.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'message':'token is invalid or has expired'}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({'success':True, 'message':'credentials is valid', 'uidb64':uidb64, 'token':token}, status=status.HTTP_200_OK)

        except DjangoUnicodeDecodeError as identifier:
            return Response({'message':'token is invalid or has expired'}, status=status.HTTP_401_UNAUTHORIZED)

class SetNewPassword(GenericAPIView):
    serializer_class=SetNewPasswordSerializer

    def patch(self, request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'success':True, 'message':"password reset is successful"}, status=status.HTTP_200_OK)
    
class LogoutUserView(GenericAPIView):
    serializer_class = LogoutUserSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        request.user.is_online = False
        request.user.save()
        log_activity(request.user, "logged_out")
        return Response(status=status.HTTP_204_NO_CONTENT)

class ResendOTPView(APIView):
    def post(self, request):
        token = request.data.get('token')
        try:
            # Decode the token without verification to get user info
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'], options={"verify_exp": False})
            user_id = decoded_token['user_id']
            user = User.objects.get(id=user_id)
            # Delete old OTP
            OneTimePassword.objects.filter(user=user).delete()
            # Generate and send new OTP
            otp_code, expiration_time, new_token = send_code_to_user(user.email)
            log_activity(user, "resent_otp")
            return Response({
                'message': 'OTP has been resent',
                'expiration_time': expiration_time,
                'token': new_token
            }, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'message': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return Response({'message': 'An error occurred while resending OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetOTPExpirationView(APIView):
    def post(self, request):
        token = request.data.get('token')
        try:
            # Decode the token without verification to get the expiration time
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'], options={"verify_exp": False})
            expiration_time = decoded_token.get('exp')
            expiration_datetime = datetime.utcfromtimestamp(expiration_time).replace(tzinfo=pytz.UTC)
            return Response({'expiration_time': expiration_datetime}, status=status.HTTP_200_OK)
        except jwt.InvalidTokenError:
            return Response({'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            return Response({'message': 'Token has no expiration time'}, status=status.HTTP_400_BAD_REQUEST)
        
class TokenRefreshView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                return Response({
                    'access': str(token.access_token)
                })
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        except (TokenError, InvalidToken) as e:
            logger.error(f'Token refresh error: {str(e)}')
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)

def index(request):
    if 'authenticated' in request.session:
        authenticated = request.session['authenticated']
    else:
        authenticated = False

    if authenticated:
        return HttpResponse("Welcome back! You are already logged in.")

    return render(request, 'index.html')

def login(request):
    request.session['authenticated'] = True
    return HttpResponse("Login successful. Cookie set.")

def logout(request):
    if 'authenticated' in request.session:
        del request.session['authenticated']
    return HttpResponse("Logged out. Cookie deleted.")