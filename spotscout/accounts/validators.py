import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from validate_email_address import validate_email

def validate_email_address(email):
    """
    Validate that the email is a valid email address.
    """
    if not validate_email(email):
        raise ValidationError(
            _('%(email)s is not a valid email address'),
            params={'email': email},
        )

class CustomPasswordValidator:
    """
    Validate whether the password meets the required criteria:
    - At least 8 characters
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(
                _("This password is too short. It must contain at least 8 characters."),
                code='password_too_short',
            )
        if not re.findall(r'[A-Z]', password):
            raise ValidationError(
                _("This password must contain at least one uppercase letter, A-Z."),
                code='password_no_upper',
            )
        if not re.findall(r'[a-z]', password):
            raise ValidationError(
                _("This password must contain at least one lowercase letter, a-z."),
                code='password_no_lower',
            )
        if not re.findall(r'\d', password):
            raise ValidationError(
                _("This password must contain at least one digit, 0-9."),
                code='password_no_digit',
            )
        if not re.findall(r'[\W_]', password):
            raise ValidationError(
                _("This password must contain at least one special character."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least 8 characters, including one uppercase letter, "
            "one lowercase letter, one digit, and one special character."
        )
