# management/commands/import_location_category.py

import csv
from django.core.management.base import BaseCommand
from location.models import LocationCategory

class Command(BaseCommand):
    help = 'Import location category data from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file.')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        
        try:
            with open(csv_file, newline='', encoding='utf-8-sig') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    LocationCategory.objects.create(
                        # id is auto-generated, so no need to pass it here
                        name=row['name'],
                        lat=float(row['lat']),
                        lon=float(row['lon']),
                        category=row['category']
                    )
                self.stdout.write(self.style.SUCCESS('Successfully imported location category data'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File "{csv_file}" not found.'))
        except KeyError as e:
            self.stdout.write(self.style.ERROR(f'Column "{e.args[0]}" not found in CSV'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
