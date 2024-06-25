from django.shortcuts import render
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveUpdateDestroyAPIView, UpdateAPIView
from .serializers import UserRegisterSerializer, LoginSerializer, PasswordResetRequestSerializer, SetNewPasswordSerializer, LogoutUserSerializer,UserSerializer, RoleSerializer, PermissionSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .utils import send_code_to_user
from .models import OneTimePassword, User
from django.contrib.auth.models import Permission
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str , DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.http import HttpResponse
from django.core.management import call_command
from datetime import datetime
import json
# Create your views here.
def log_activity(user, action):
    log_entry = {
        "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "user": user.email,
        "action": action
    }
    with open("activity.log", "a") as log_file:
        log_file.write(json.dumps(log_entry) + "\n")

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
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, *args, **kwargs):
        user = self.get_object()
        refresh = RefreshToken.for_user(user)
        refresh.blacklist()
        return Response({"detail": "User logged out successfully"}, status=status.HTTP_200_OK)

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
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, *args, **kwargs):
        log_data = []
        with open("activity.log", "r") as log_file:
            for line in log_file:
                log_data.append(json.loads(line.strip()))
        return Response(log_data, status=status.HTTP_200_OK)
class RegisterUserView(GenericAPIView):
    serializer_class=UserRegisterSerializer
    
    def post(self,request):
        user_data=request.data
        serializer =self.serializer_class(data=user_data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user=serializer.data
            send_code_to_user(user['email'])
            print(user)
            return Response({
                'data': user,
                'message':f'Thanks for signing up!'
            },status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class VerifyUserEmail(GenericAPIView):
    def post(sle, request):
        otpcode=request.data.get('otp')
        try:
            user_code_obj=OneTimePassword.objects.get(code=otpcode)
            user = user_code_obj.user
            if not user.is_verified:
                user.is_verified=True
                user.save()
                return Response({
                    'message':'account email verified successfully'
                }, status=status.HTTP_200_OK)
            return Response({
                'message':'code is invalid user already verified'
            }, status=status.HTTP_204_CONTENT)
        
        except OneTimePassword.DoesNotExist:
            return Response({'message':'passcode not provided'}, status=status.HTTP_404_NOT_FOUND)
        

class LoginUserView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
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
    serializer_class=LogoutUserSerializer
    permission_classes=[IsAuthenticated]

    def post(self, request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResendOTPView(GenericAPIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # ลบ OTP เก่าของผู้ใช้
            OneTimePassword.objects.filter(user=user).delete()
            # สร้าง OTP ใหม่
            send_code_to_user(email)
            return Response({'message': 'OTP has been resent'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)

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