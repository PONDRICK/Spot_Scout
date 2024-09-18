# management/commands/import_closed_businesses.py

import csv
from django.core.management.base import BaseCommand
from location.models import ClosedBusinessCount  # Adjust the app name if necessary

class Command(BaseCommand):
    help = 'Import closed businesses data from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file.')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        
        try:
            with open(csv_file, newline='', encoding='utf-8-sig') as csvfile:  # Using 'utf-8-sig' to handle BOM
                reader = csv.DictReader(csvfile)
                for row in reader:
                    ClosedBusinessCount.objects.create(
                        subdistrict=row['ตำบล'],
                        district=row['อำเภอ'],
                        province=row['จังหวัด'],
                        count=int(row['Count'])
                    )
                self.stdout.write(self.style.SUCCESS('Successfully imported closed businesses data'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File "{csv_file}" not found.'))
        except KeyError as e:
            self.stdout.write(self.style.ERROR(f'Column "{e.args[0]}" not found in CSV'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
