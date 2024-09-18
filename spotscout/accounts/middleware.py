# accounts/middleware.py
from django.utils.deprecation import MiddlewareMixin
from django.utils.timezone import now
from django.contrib.auth import logout

class UpdateLastActivityMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.user.is_authenticated:
            if request.user.is_banned:
                logout(request)
            else:
                request.user.last_login = now()
                request.user.save(update_fields=['last_login'])
        return None
