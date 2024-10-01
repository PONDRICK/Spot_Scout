import csv
from django.core.management.base import BaseCommand
from location.models import Location

class Command(BaseCommand):
    help = 'Imports locations from a CSV file into the Location model.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file to import.')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']

        # Delete existing data
        Location.objects.all().delete()

        with open(csv_file, 'r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            fieldnames = reader.fieldnames

            # Remove BOM and normalize fieldnames
            fieldnames = [field.strip().lstrip('\ufeff').lower() for field in fieldnames]
            reader.fieldnames = fieldnames  # Update the fieldnames in the reader

            # Normalize required fields
            required_fields = ['id', 'name', 'lat', 'lon', 'amenity', 'province']
            required_fields = [field.lower() for field in required_fields]

            # Print fieldnames for debugging
            print(f"Fieldnames detected: {fieldnames}")

            missing_fields = [field for field in required_fields if field not in fieldnames]
            if missing_fields:
                self.stdout.write(self.style.ERROR(f'Missing required columns: {missing_fields}'))
                return

            locations = []
            for row in reader:
                try:
                    location = Location(
                        source_id=int(row['id']),
                        name=row['name'],
                        lat=float(row['lat']),
                        lon=float(row['lon']),
                        amenity=row['amenity'],
                        province=row['province'],
                        category=row.get('category', '')  # Provide default if 'category' is missing
                    )
                    locations.append(location)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing row {row}: {e}"))
                    continue  # Skip to the next row

            # Bulk create the Location instances
            Location.objects.bulk_create(locations)
        self.stdout.write(self.style.SUCCESS('Successfully imported locations from %s' % csv_file))
