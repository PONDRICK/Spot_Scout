from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .managers import UserManager
from .validators import validate_email_address
from django.utils import timezone
from datetime import timedelta

# Create your models here.

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        max_length=255, verbose_name=_("Email Address"), unique=True,
        validators=[validate_email_address]
    )
    first_name = models.CharField(max_length=100, verbose_name=_("First Name"))
    last_name = models.CharField(max_length=100, verbose_name=_("Last Name"))
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_verified=models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False) 
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD="email"
    
    REQUIRED_FIELDS=["first_name", "last_name"]
    
    objects = UserManager()
    
    def __str__(self) -> str:
        return self.email
    
    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
             'refresh' : str(refresh),
             'access' : str(refresh.access_token)
        }


    
class OneTimePassword(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, unique=True)
    expires_at = models.DateTimeField()
    last_resent_at = models.DateTimeField(null=True, blank=True)  # New field

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=3)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.first_name} -- passcode"
        
        
User = get_user_model()

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # เพิ่มฟิลด์นี้
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.timestamp} - {self.ip_address}"