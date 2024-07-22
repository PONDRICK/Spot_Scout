import random
from django.core.mail import EmailMessage
from django.utils.html import format_html
from spotscout import settings
from .models import User, OneTimePassword
from .models import ActivityLog
from django.utils import timezone
from datetime import timedelta

def generateOtp():
    otp = ""
    for i in range(6):
        otp += str(random.randint(1, 9))
    return otp

def send_code_to_user(email):
    Subject = "One time passcode for Email verification"
    otp_code = generateOtp()
    print(otp_code)
    user = User.objects.get(email=email)
    current_site = "Spotscout.com"
    
    email_body = format_html(
        '''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">One Time Passcode (OTP) Verification</h2>
            <p style="color: #555; text-align: center;">Hi <strong>{first_name}</strong>,</p>
            <p style="color: #555; text-align: center;">Thanks for signing up at <a href="https://{current_site}" style="color: #0066cc; text-decoration: none;">{current_site}</a>. Please verify your email by entering the following one-time passcode (OTP):</p>
            <div style="font-size: 24px; font-weight: bold; color: #333; text-align: center; margin: 20px 0; border: 1px solid #ccc; border-radius: 5px; padding: 10px; background-color: #fff;">
                {otp_code}
            </div>
            <p style="color: #555; text-align: center;">If you did not sign up for an account, you can ignore this email.</p>
            <p style="color: #555; text-align: center;">Best regards,<br>The Spotscout Team</p>
            <hr style="border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message, please do not reply.</p>
        </div>
        ''',
        first_name=user.first_name,
        current_site=current_site,
        otp_code=otp_code
    )

    from_email = settings.DEFAULT_FROM_EMAIL
    expiration_time = timezone.now() + timedelta(minutes=3)
    OneTimePassword.objects.create(user=user, code=otp_code, expires_at=expiration_time)
    
    d_email = EmailMessage(subject=Subject, body=email_body, from_email=from_email, to=[email])
    d_email.content_subtype = "html"  # Main content is now text/html
    d_email.send(fail_silently=True)

    return otp_code, expiration_time  # Return the OTP code and expiration time

def send_normal_email(data):
    email = EmailMessage(
        subject=data['email_subject'],
        body=data['email_body'],
        from_email=settings.EMAIL_HOST_USER,
        to=[data['to_email']]
    )
    email.send()

def log_activity(user, action):
    ActivityLog.objects.create(user=user, action=action)