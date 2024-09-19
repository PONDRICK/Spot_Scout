import random
from django.core.mail import EmailMessage
from django.utils.html import format_html
from spotscout import settings
from .models import User, OneTimePassword
from .models import ActivityLog
from django.utils import timezone
from datetime import datetime, timedelta
import jwt

def generateOtp():
    otp = ""
    for i in range(6):
        otp += str(random.randint(1, 9))
    return otp

def generate_verification_token(user):
    otp_code = generateOtp()
    expiration_time = timezone.now() + timedelta(minutes=3)
    otp_record = OneTimePassword.objects.create(user=user, code=otp_code, expires_at=expiration_time)
    
    payload = {
        'user_id': user.id,
        'email': user.email,
        'exp': expiration_time.timestamp()  # Use timestamp for 'exp'
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token, expiration_time, otp_code

def send_code_to_user(email):
    Subject = "One time passcode for Email verification"
    user = User.objects.get(email=email)
    current_site = "Spotscout.com"
    otp_code = generateOtp()
    expiration_time = timezone.now() + timedelta(minutes=3)
    
    # Get or create the OTP record
    otp_record, created = OneTimePassword.objects.get_or_create(user=user)
    otp_record.code = otp_code
    otp_record.expires_at = expiration_time
    otp_record.last_resent_at = timezone.now()
    otp_record.save()
    
    token = jwt.encode({
        'user_id': user.id,
        'email': user.email,
        'exp': expiration_time.timestamp()
    }, settings.SECRET_KEY, algorithm='HS256')
    
    verification_link = f"http://localhost:4200/verify-otp/{token}/"

    email_body = format_html(
        '''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">One Time Passcode (OTP) Verification</h2>
            <p style="color: #555; text-align: center;">Hi <strong>{first_name}</strong>,</p>
            <p style="color: #555; text-align: center;">Thanks for signing up at <a href="https://{current_site}" style="color: #0066cc; text-decoration: none;">{current_site}</a>. Please verify your email by entering the following one-time passcode (OTP) or click the link below:</p>
            <div style="font-size: 24px; font-weight: bold; color: #333; text-align: center; margin: 20px 0; border: 1px solid #ccc; border-radius: 5px; padding: 10px; background-color: #fff;">
                {otp_code}
            </div>
            <p style="color: #555; text-align: center;">Or click <a href="{verification_link}">this link</a> to verify your email.</p>
            <p style="color: #555; text-align: center;">If you did not sign up for an account, you can ignore this email.</p>
            <p style="color: #555; text-align: center;">Best regards,<br>The Spotscout Team</p>
            <hr style="border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message, please do not reply.</p>
        </div>
        ''',
        first_name=user.first_name,
        current_site=current_site,
        otp_code=otp_code,
        verification_link=verification_link
    )

    from_email = settings.DEFAULT_FROM_EMAIL
    
    d_email = EmailMessage(subject=Subject, body=email_body, from_email=from_email, to=[email])
    d_email.content_subtype = "html"
    d_email.send(fail_silently=True)
    
    return otp_code, expiration_time, token

def send_normal_email(data):
    email = EmailMessage(
        subject=data['email_subject'],
        body=data['email_body'],
        from_email=settings.EMAIL_HOST_USER,
        to=[data['to_email']]
    )
    email.send()

def log_activity(user, action, request=None):
    ip_address = request.META.get('REMOTE_ADDR') if request else None
    ActivityLog.objects.create(user=user, action=action, ip_address=ip_address)