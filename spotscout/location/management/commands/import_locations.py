import csv
from django.core.management.base import BaseCommand
from location.models import Location

class Command(BaseCommand):
    help = 'Load locations from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The CSV file to load')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']

        with open(csv_file, newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                # Convert empty strings to None
                name = row['name'] if row['name'] else 'Unknown'
                try:
                    location = Location.objects.create(
                        name=row['name'],
                        lat=float(row['lat']),
                        lon=float(row['lon']),
                        amenity=row['amenity'],
                        province=row['province'],
                        ISO3166_2=row['ISO3166-2'],  # Updated field name
                        distance_nearest_bank=float(row.get('distance_nearest_bank', 0)),
                        distance_nearest_fuel=float(row.get('distance_nearest_fuel', 0)),
                        distance_nearest_office=float(row.get('distance_nearest_office', 0)),
                        distance_nearest_police=float(row.get('distance_nearest_police', 0)),
                        distance_nearest_townhall=float(row.get('distance_nearest_townhall', 0)),
                        distance_nearest_bus_station=float(row.get('distance_nearest_bus_station', 0)),
                        distance_nearest_bus_stop=float(row.get('distance_nearest_bus_stop', 0)),
                        distance_nearest_convenience=float(row.get('distance_nearest_convenience', 0)),
                        distance_nearest_mall=float(row.get('distance_nearest_mall', 0)),
                        distance_nearest_supermarket=float(row.get('distance_nearest_supermarket', 0)),
                        distance_nearest_books=float(row.get('distance_nearest_books', 0)),
                        distance_nearest_coffee=float(row.get('distance_nearest_coffee', 0)),
                        distance_nearest_department_store=float(row.get('distance_nearest_department_store', 0)),
                        distance_nearest_clothes=float(row.get('distance_nearest_clothes', 0)),
                        distance_nearest_bakery=float(row.get('distance_nearest_bakery', 0)),
                        distance_nearest_cafe=float(row.get('distance_nearest_cafe', 0)),
                        count_bank_within_500m=int(row.get('count_bank_within_500m', 0)),
                        count_fuel_within_500m=int(row.get('count_fuel_within_500m', 0)),
                        count_office_within_500m=int(row.get('count_office_within_500m', 0)),
                        count_police_within_500m=int(row.get('count_police_within_500m', 0)),
                        count_townhall_within_500m=int(row.get('count_townhall_within_500m', 0)),
                        count_bus_station_within_500m=int(row.get('count_bus_station_within_500m', 0)),
                        count_bus_stop_within_500m=int(row.get('count_bus_stop_within_500m', 0)),
                        count_convenience_within_500m=int(row.get('count_convenience_within_500m', 0)),
                        count_mall_within_500m=int(row.get('count_mall_within_500m', 0)),
                        count_supermarket_within_500m=int(row.get('count_supermarket_within_500m', 0)),
                        count_books_within_500m=int(row.get('count_books_within_500m', 0)),
                        count_coffee_within_500m=int(row.get('count_coffee_within_500m', 0)),
                        count_department_store_within_500m=int(row.get('count_department_store_within_500m', 0)),
                        count_clothes_within_500m=int(row.get('count_clothes_within_500m', 0)),
                        count_bakery_within_500m=int(row.get('count_bakery_within_500m', 0)),
                        count_cafe_within_500m=int(row.get('count_cafe_within_500m', 0)),
                        count_viewpoint_within_500m=int(row.get('count_viewpoint_within_500m', 0)),
                        count_attraction_within_500m=int(row.get('count_attraction_within_500m', 0)),
                        count_camp_site_within_500m=int(row.get('count_camp_site_within_500m', 0)),
                        count_guest_house_within_500m=int(row.get('count_guest_house_within_500m', 0)),
                        count_information_within_500m=int(row.get('count_information_within_500m', 0)),
                        count_museum_within_500m=int(row.get('count_museum_within_500m', 0)),
                        count_zoo_within_500m=int(row.get('count_zoo_within_500m', 0)),
                        count_picnic_site_within_500m=int(row.get('count_picnic_site_within_500m', 0)),
                        count_hotel_within_500m=int(row.get('count_hotel_within_500m', 0)),
                        count_motel_within_500m=int(row.get('count_motel_within_500m', 0)),
                        count_chalet_within_500m=int(row.get('count_chalet_within_500m', 0)),
                        count_artwork_within_500m=int(row.get('count_artwork_within_500m', 0)),
                        count_wilderness_hut_within_500m=int(row.get('count_wilderness_hut_within_500m', 0)),
                        count_waterfall_within_500m=int(row.get('count_waterfall_within_500m', 0)),
                        distance_nearest_restaurant=float(row.get('distance_nearest_restaurant', 0)),
                        distance_nearest_fast_food=float(row.get('distance_nearest_fast_food', 0)),
                        distance_nearest_village=float(row.get('distance_nearest_village', 0)),
                        distance_nearest_hospital=float(row.get('distance_nearest_hospital', 0)),
                        distance_nearest_pharmacy=float(row.get('distance_nearest_pharmacy', 0)),
                        distance_nearest_clinic=float(row.get('distance_nearest_clinic', 0)),
                        distance_nearest_hotel=float(row.get('distance_nearest_hotel', 0)),
                        distance_nearest_apartment=float(row.get('distance_nearest_apartment', 0)),
                        distance_nearest_atm=float(row.get('distance_nearest_atm', 0)),
                        distance_nearest_traffic_signals=float(row.get('distance_nearest_traffic_signals', 0)),
                        distance_nearest_station=float(row.get('distance_nearest_station', 0)),
                        distance_nearest_school=float(row.get('distance_nearest_school', 0)),
                        distance_nearest_motorway_junction=float(row.get('distance_nearest_motorway_junction', 0)),
                        distance_nearest_crossing=float(row.get('distance_nearest_crossing', 0)),
                        distance_nearest_viewpoint=float(row.get('distance_nearest_viewpoint', 0)),
                        distance_nearest_attraction=float(row.get('distance_nearest_attraction', 0)),
                                                distance_nearest_camp_site=float(row.get('distance_nearest_camp_site', 0)),
                        distance_nearest_guest_house=float(row.get('distance_nearest_guest_house', 0)),
                        distance_nearest_information=float(row.get('distance_nearest_information', 0)),
                        distance_nearest_museum=float(row.get('distance_nearest_museum', 0)),
                        distance_nearest_zoo=float(row.get('distance_nearest_zoo', 0)),
                        distance_nearest_picnic_site=float(row.get('distance_nearest_picnic_site', 0)),
                        distance_nearest_motel=float(row.get('distance_nearest_motel', 0)),
                        distance_nearest_chalet=float(row.get('distance_nearest_chalet', 0)),
                        distance_nearest_artwork=float(row.get('distance_nearest_artwork', 0)),
                        distance_nearest_wilderness_hut=float(row.get('distance_nearest_wilderness_hut', 0)),
                        distance_nearest_waterfall=float(row.get('distance_nearest_waterfall', 0)),
                        count_restaurant_within_500m=int(row.get('count_restaurant_within_500m', 0)),
                        count_fast_food_within_500m=int(row.get('count_fast_food_within_500m', 0)),
                        count_village_within_500m=int(row.get('count_village_within_500m', 0)),
                        count_hospital_within_500m=int(row.get('count_hospital_within_500m', 0)),
                        count_pharmacy_within_500m=int(row.get('count_pharmacy_within_500m', 0)),
                        count_clinic_within_500m=int(row.get('count_clinic_within_500m', 0)),
                        count_apartment_within_500m=int(row.get('count_apartment_within_500m', 0)),
                        count_atm_within_500m=int(row.get('count_atm_within_500m', 0)),
                        count_traffic_signals_within_500m=int(row.get('count_traffic_signals_within_500m', 0)),
                        count_station_within_500m=int(row.get('count_station_within_500m', 0)),
                        count_school_within_500m=int(row.get('count_school_within_500m', 0)),
                        count_motorway_junction_within_500m=int(row.get('count_motorway_junction_within_500m', 0)),
                        count_crossing_within_500m=int(row.get('count_crossing_within_500m', 0)),
                        population=int(row.get('population', 0))
                    )

                    self.stdout.write(self.style.SUCCESS(f'Successfully imported {row["name"]}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing {row["name"]}: {str(e)}'))
