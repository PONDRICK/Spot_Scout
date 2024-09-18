# location/management/commands/clear_locations.py

from django.core.management.base import BaseCommand
from location.models import Location

class Command(BaseCommand):
    help = 'Clear all data from Location table'

    def handle(self, *args, **kwargs):
        try:
            Location.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Successfully cleared all data from Location table'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error clearing data from Location table: {str(e)}'))
