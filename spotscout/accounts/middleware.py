# accounts/middleware.py
from django.utils.deprecation import MiddlewareMixin
from django.utils.timezone import now

class UpdateLastActivityMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.user.is_authenticated:
            request.user.last_login = now()
            request.user.save(update_fields=['last_login'])
        return None
