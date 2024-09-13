import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit, OnInit, OnDestroy {
  searchControl = new FormControl();
  filteredOptions!: Observable<string[]>;
  amenities: string[] = [
    'alcohol',
    'apartment',
    'artwork',
    'atm',
    'bakery',
    'bank',
    'bar',
    'beauty',
    'beverages',
    'bus_stop',
    'cafe',
    'car',
    'clinic',
    'clothes',
    'computer',
    'coffee',
    'college',
    'convenience',
    'crossing',
    'department_store',
    'dentist',
    'fast_food',
    'fire_station',
    'florist',
    'fuel',
    'hairdresser',
    'hamlet',
    'hospital',
    'hostel',
    'hotel',
    'information',
    'jewelry',
    'kiosk',
    'laundry',
    'library',
    'mall',
    'massage',
    'mobile_phone',
    'motel',
    'motorcycle',
    'museum',
    'musical_instrument',
    'office',
    'outdoor',
    'pharmacy',
    'police',
    'post_office',
    'resort',
    'restaurant',
    'school',
    'shoes',
    'sports',
    'station',
    'supermarket',
    'townhall',
    'tyres',
    'university',
    'village',
    'zoo',
  ];

  functions: string[] = ['nearest', 'count', 'population', 'predict', 'economy'];

  private map: any;
  private marker: any;
  private polylines: any[] = [];
  private circles: any[] = [];
  private markers: any[] = [];
  private navigationSubscription: Subscription | undefined;
  suggestions: any[] = [];
  @ViewChild('latInput') latInput!: ElementRef<HTMLInputElement>;
  @ViewChild('lonInput') lonInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('amenitySelect') amenitySelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('functionDropdownContainer')
  functionDropdownContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('amenityDropdownContainer')
  amenityDropdownContainer!: ElementRef<HTMLDivElement>;

  dropdownOpen = false;
  dropdownAmenityOpen = false;
  isSidebarOpen = false;
  selectedFunction = 'nearest';
  selectedAmenity = 'restaurant';
  outputs: any[] = [];
  distance = 1000; // Default distance
  private redIcon: any;
  private greenIcon: any; // Add green icon
  private blueIcon: any; // Add blue icon
  isMarkerLocked = false;
  isMenuOpen = false;
  saveIcon = SaveAltIcon;
  historyIcon = HistoryIcon;
  logoutIcon = LogoutIcon;

  showHistoryModal = false;
  savedMaps: any[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private http: HttpClient,
    private sharedService: SharedService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );

    const mapData = this.sharedService.getMapData();
    if (mapData) {
      console.log('Received map data in ngOnInit:', mapData);
      this.initOrReinitMap().then(() => {
        this.loadMap(mapData);
        this.sharedService.clearMapData();
      });
    }
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initOrReinitMap();
      }
    });
  }

  ngOnDestroy() {
    this.cleanup();
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
      console.log('destroy');
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
      this.amenitySelect.nativeElement.addEventListener(
        'keydown',
        this.onKeyDown.bind(this)
      );
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.amenities.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const options = Array.from(this.amenitySelect.nativeElement.options);
    const index = options.findIndex((option) =>
      option.value.toLowerCase().startsWith(key)
    );

    if (index !== -1) {
      this.amenitySelect.nativeElement.selectedIndex = index;
      this.selectedAmenity = this.amenities[index];
    }
  }

  toggleLocationVisibility(place: any) {
    place.locationsVisible = !place.locationsVisible;
  }

  getDisplayedLocations(place: any) {
    return place.locationsVisible ? place.locations : [];
  }

  private async initOrReinitMap(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadLeaflet();
    }
  }

  private async loadLeaflet(): Promise<void> {
    const L = await import('leaflet');
    await import('@geoman-io/leaflet-geoman-free');
    this.initMap(L);
  }

  private initMap(L: any): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || (mapContainer && (mapContainer as any)._leaflet_id)) {
      console.log('Map instance already exists');
      return;
    }

    const bounds = [
      [5.0, 97.0],
      [21.0, 106.0],
    ];

    this.map = L.map('map', {
      center: [15.87, 100.9925],
      zoom: 6,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      dragging: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.setMinZoom(6);

    this.map.on('zoomend', () => {
      if (this.map.getZoom() > 6) {
        this.map.dragging.enable();
      } else {
        this.map.dragging.disable();
      }
    });

    this.redIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.greenIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      iconSize: [16, 28],
      iconAnchor: [8, 28],
      popupAnchor: [1, -34],
      shadowSize: [28, 28],
    });

    this.blueIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.map.on('click', (e: any) => {
      if (this.isSidebarOpen && !this.isMarkerLocked) {
        const lat = e.latlng.lat.toFixed(4);
        const lon = e.latlng.lng.toFixed(4);
        if (this.outputs.length > 0) {
          Swal.fire({
            title: 'Change Location?',
            html: 'Do you want to change the location?<br>Unsaved progress will be lost.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
          }).then((result) => {
            if (result.isConfirmed) {
              this.clearOutputsAndOverlays();
              this.updateLocation(lat, lon, e.latlng);
            }
          });
        } else {
          this.updateLocation(lat, lon, e.latlng);
        }
      }
    });

    this.map.pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawPolygon: true,
      drawPolyline: true,
      drawCircle: true,
      drawRectangle: true,
      drawCircleMarker: true,
      drawText: true,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
      rotateMode: true,
    });

    this.map.on('pm:create', (e: any) => {
      const layer = e.layer;
      if (e.shape === 'Text') {
        layer.options.editable = true;
        layer.on('click', () => {
          layer.pm.enable();
        });
      } else if (layer instanceof L.Marker) {
        layer.setIcon(this.blueIcon);
      }
      console.log('Created new layer', layer);
    });

    this.map.on('pm:remove', (e: any) => {
      if ((e.layer as any).isOutputLayer) {
        console.log('Attempted to remove protected layer, action prevented.');
        e.layer.addTo(this.map);
      }
    });

    this.map.on('pm:globaleditmodetoggled', (e: any) => {
      const { enabled } = e;
      if (enabled) {
        this.disableEditModeForOutputs();
      }
    });

    this.map.on('pm:globaldragmodetoggled', (e: any) => {
      const { enabled } = e;
      if (enabled) {
        this.disableDragModeForOutputs();
      }
    });

    this.map.on('pm:globalcutmodetoggled', (e: any) => {
      const { enabled } = e;
      if (enabled) {
        this.disableCutModeForOutputs();
      }
    });

    this.map.on('pm:globalremovalmodetoggled', (e: any) => {
      const { enabled } = e;
      if (enabled) {
        this.disableRemovalModeForOutputs();
      }
    });

    this.map.on('pm:globalrotatemodetoggled', (e: any) => {
      const { enabled } = e;
      if (enabled) {
        this.disableRotateModeForOutputs();
      }
    });
  }

  private disableEditModeForOutputs() {
    this.outputs.forEach((output) => {
      if (output.polyline) {
        output.polyline.pm.disable();
      }
      if (output.circle) {
        output.circle.pm.disable();
      }
      if (output.markers) {
        output.markers.forEach((marker: any) => marker.pm.disable());
      }
      if (output.redMarker) {
        output.redMarker.pm.disable();
      }
    });
  }

  private disableDragModeForOutputs() {
    this.outputs.forEach((output) => {
      if (output.polyline) {
        output.polyline.pm.disable();
      }
      if (output.circle) {
        output.circle.pm.disable();
      }
      if (output.markers) {
        output.markers.forEach((marker: any) => marker.pm.disable());
      }
      if (output.redMarker) {
        output.redMarker.pm.disable();
      }
    });
  }

  private disableCutModeForOutputs() {
    this.outputs.forEach((output) => {
      if (output.polyline) {
        output.polyline.pm.disable();
      }
      if (output.circle) {
        output.circle.pm.disable();
      }
      if (output.markers) {
        output.markers.forEach((marker: any) => marker.pm.disable());
      }
      if (output.redMarker) {
        output.redMarker.pm.disable();
      }
    });
  }

  private disableRemovalModeForOutputs() {
    this.outputs.forEach((output) => {
      if (output.polyline) {
        output.polyline.pm.disable();
      }
      if (output.circle) {
        output.circle.pm.disable();
      }
      if (output.markers) {
        output.markers.forEach((marker: any) => marker.pm.disable());
      }
      if (output.redMarker) {
        output.redMarker.pm.disable();
      }
    });
  }

  private disableRotateModeForOutputs() {
    this.outputs.forEach((output) => {
      if (output.polyline) {
        output.polyline.pm.disableRotate();
      }
      if (output.circle) {
        output.circle.pm.disableRotate();
      }
      if (output.markers) {
        output.markers.forEach((marker: any) => marker.pm.disableRotate());
      }
      if (output.redMarker) {
        output.redMarker.pm.disableRotate();
      }
    });
  }

  private updateLocation(lat: string, lon: string, latlng: any): void {
    this.latInput.nativeElement.value = lat;
    this.lonInput.nativeElement.value = lon;

    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      import('leaflet').then((L) => {
        this.marker = L.marker(latlng, { icon: this.redIcon }).addTo(this.map);
        (this.marker as any).isOutputLayer = true;

        this.marker.on('pm:dragend', () => {
          this.redrawMarker();
        });
      });
    }
  }

  private redrawMarker() {
    const lat = parseFloat(this.latInput.nativeElement.value);
    const lon = parseFloat(this.lonInput.nativeElement.value);
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    }
  }

  private clearOutputsAndOverlays() {
    this.outputs = [];
    this.polylines.forEach((polyline) => polyline.remove());
    this.polylines = [];
    this.circles.forEach((circle) => circle.remove());
    this.circles = [];
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
    this.map.eachLayer((layer: any) => {
      if (layer.pm && !layer.isOutputLayer) {
        layer.remove();
      }
    });
  }

  private cleanupMap() {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
      console.log('clean up Map');
    }
  }

  private cleanup() {
    this.cleanupMap();
  }

  logout() {
    this.isMenuOpen = false;

    const refreshToken = this.apiService.getCookie('refresh_token');
    if (refreshToken) {
      this.apiService.logoutUser(refreshToken).subscribe(
        (response) => {
          console.log('Logout successful', response);
          this.apiService.clearToken();
          this.cleanup();
          this.navigateAfterLogout();
        },
        (error) => {
          console.error('Logout failed', error);
          this.apiService.clearToken();
          this.cleanup();
          this.navigateAfterLogout();
        }
      );
    }
  }

  private navigateAfterLogout() {
    window.location.replace('/login');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleAmenityDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownAmenityOpen = !this.dropdownAmenityOpen;
  }

  selectFunction(selectedFunction: string, event: Event) {
    event.stopPropagation(); // ป้องกันการกระจาย event ต่อไป
    console.log('Function selected:', selectedFunction);
    this.selectedFunction = selectedFunction;
    this.dropdownOpen = false;
    console.log('Dropdown should be closed:', this.dropdownOpen);
  }

  selectAmenity(amenity: string, event: Event) {
    event.stopPropagation(); // ป้องกันการกระจาย event ต่อไป
    console.log('Amenity selected:', amenity);
    this.selectedAmenity = amenity;
    this.dropdownAmenityOpen = false;
    console.log('Dropdown should be closed:', this.dropdownAmenityOpen);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
  // Check if functionDropdownContainer exists and contains the event target
  if (
    this.functionDropdownContainer &&
    this.functionDropdownContainer.nativeElement &&
    !this.functionDropdownContainer.nativeElement.contains(event.target as Node)
  ) {
    this.dropdownOpen = false;
  }

  // Check if amenityDropdownContainer exists and contains the event target
  if (
    this.amenityDropdownContainer &&
    this.amenityDropdownContainer.nativeElement &&
    !this.amenityDropdownContainer.nativeElement.contains(event.target as Node)
  ) {
    this.dropdownAmenityOpen = false;
  }
}


  private outputExists(
    lat: number,
    lon: number,
    functionType: string,
    amenity?: string,
    distance?: number
  ): boolean {
    return this.outputs.some((output) => {
      if (output.type !== functionType) {
        return false;
      }

      switch (functionType) {
        case 'nearest':
          return output.amenity === amenity;
        case 'count':
          return (
            output.amenity === amenity &&
            output.distance === distance &&
            output.lat === lat &&
            output.lon === lon
          );
        case 'population':
          return (
            output.distance === distance &&
            output.lat === lat &&
            output.lon === lon
          );
        case 'predict':
          return output.lat === lat && output.lon === lon;
        default:
          return false;
      }
    });
  }

  private isOutputRemoved(output: any): boolean {
    return !this.outputs.includes(output);
  }

  validateDistance() {
    if (this.selectedFunction === 'count' && this.distance > 10000) {
      this.distance = 10000;
    } else if (
      this.selectedFunction === 'population' &&
      this.distance > 10000
    ) {
      this.distance = 10000;
    } else if (this.distance < 100) {
      this.distance = 100;
    }
  }

  confirmSelection() {
    this.validateDistance();

    const lat = parseFloat(this.latInput.nativeElement.value);
    const lon = parseFloat(this.lonInput.nativeElement.value);

    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      import('leaflet').then((L) => {
        this.marker = L.marker([lat, lon], { icon: this.redIcon }).addTo(
          this.map
        );
        (this.marker as any).isOutputLayer = true;

        this.marker.on('pm:dragend', () => {
          this.redrawMarker();
        });
      });
    }

    this.map.setView([lat, lon], this.map.getZoom());

    if (
      this.outputExists(
        lat,
        lon,
        this.selectedFunction,
        this.selectedAmenity,
        this.distance
      )
    ) {
      console.log(
        `Output for ${this.selectedFunction} from lat ${lat}, lon ${lon} already exists`
      );
      return;
    }

    const loadingOutput = {
      type: this.selectedFunction,
      loading: true,
      visible: true,
      lat: lat,
      lon: lon,
      amenity: this.selectedAmenity,
      distance: this.distance,
      startLat: lat,
      startLon: lon,
    };
    this.outputs.unshift(loadingOutput);

    if (this.selectedFunction === 'nearest') {
      this.apiService
        .getNearestPlace(lat, lon, this.selectedAmenity)
        .subscribe({
          next: (response) => {
            if (this.isOutputRemoved(loadingOutput)) return;
            import('leaflet').then((L) => {
              const polyline = L.polyline(
                [
                  [lat, lon],
                  [response.lat, response.lon],
                ],
                { color: 'black', dashArray: '5, 10' }
              ).addTo(this.map);
              (polyline as any).isOutputLayer = true;
              this.polylines.push(polyline);
              loadingOutput.loading = false;
              Object.assign(loadingOutput, {
                amenity: response.amenity,
                distance: response.distance,
                province: response.province,
                lat: response.lat,
                lon: response.lon,
                polyline: polyline,
                startLat: lat,
                startLon: lon,
              });

              polyline.on('pm:dragend', () => {
                this.redrawOutput(loadingOutput);
              });

              polyline.on('pm:cut', (e: any) => {
                e.layer.remove();
                this.polylines = this.polylines.filter((p) => p !== e.layer);
                this.redrawOutput(loadingOutput);
                polyline.addTo(this.map);
              });
            });
          },
          error: (error) =>
            console.error('Error fetching nearest place:', error),
        });
    } else if (this.selectedFunction === 'count') {
      this.apiService
        .countAmenities(lat, lon, this.selectedAmenity, this.distance)
        .subscribe({
          next: (response) => {
            if (this.isOutputRemoved(loadingOutput)) return;
            import('leaflet').then((L) => {
              const circle = L.circle([lat, lon], {
                radius: this.distance,
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.2,
              }).addTo(this.map);
              (circle as any).isOutputLayer = true;
              this.circles.push(circle);
              const markers = response.locations.map((location: any) => {
                const marker = L.marker([location.lat, location.lon], {
                  icon: this.greenIcon,
                }).addTo(this.map);
                (marker as any).isOutputLayer = true;
                this.markers.push(marker);
                return marker;
              });
              loadingOutput.loading = false;
              Object.assign(loadingOutput, {
                count: response.count,
                distance: this.distance,
                locations: response.locations,
                circle: circle,
                markers: markers,
              });

              circle.on('pm:dragend', () => {
                this.redrawOutput(loadingOutput);
              });

              markers.forEach((marker: any) => {
                marker.on('pm:dragend', () => {
                  this.redrawOutput(loadingOutput);
                });
              });
            });
          },
          error: (error) => console.error('Error counting amenities:', error),
        });
    } else if (this.selectedFunction === 'population') {
      this.apiService.getPopulation(lat, lon, this.distance).subscribe({
        next: (response) => {
          if (this.isOutputRemoved(loadingOutput)) return;
          loadingOutput.loading = false;
          Object.assign(loadingOutput, {
            population: response.population,
            distance: this.distance,
          });
        },
        error: (error) => console.error('Error fetching population:', error),
      });
    } else if (this.selectedFunction === 'predict') {
      this.apiService.predictModel(lat, lon).subscribe({
        next: (response) => {
          if (this.isOutputRemoved(loadingOutput)) return;
          import('leaflet').then((L) => {
            if (
              response &&
              response.ranked_predictions &&
              response.ranked_predictions.length > 0
            ) {
              const top3Predictions: Array<{
                category: string;
                score: number;
              }> = response.ranked_predictions.slice(0, 3);
              const remainingScore =
                response.ranked_predictions
                  .slice(3)
                  .reduce(
                    (acc: number, curr: { score: number }) => acc + curr.score,
                    0
                  ) * 100;

              console.log('Top 3 Predictions:', top3Predictions);

              const predictionHtml = top3Predictions
                .map((pred: { category: string; score: number }) => {
                  const category = pred.category ? pred.category : 'Unknown';
                  const score = pred.score
                    ? (pred.score * 100).toFixed(2)
                    : '0.00';
                  return `<p>${category} : ${score}%</p>`;
                })
                .join('');

              const popupContent = `
                            <div class="predict-info-box">
                                <p>Predicted Amenity Category:</p>
                                <p>${top3Predictions[0].category}</p>
                            </div>`;

              if (this.marker) {
                this.marker
                  .bindPopup(popupContent, { className: 'custom-popup' })
                  .openPopup();
              }
              loadingOutput.loading = false;
              Object.assign(loadingOutput, {
                predicted_amenity_category: top3Predictions[0].category,
                top_predictions: top3Predictions,
                remaining_score: remainingScore,
                marker: this.marker,
                popupContent: popupContent,
              });
            } else {
              console.error('Invalid response format:', response);
            }
          });
        },
        error: (error) => console.error('Error predicting model:', error),
      });
    }else if (this.selectedFunction === 'economy') {
      this.apiService.getEconomyDetails(lat, lon).subscribe({
        next: (response) => {
          console.log('Economy data received:', response);
          if (this.isOutputRemoved(loadingOutput)) return;
          loadingOutput.loading = false;
          Object.assign(loadingOutput, {
            subdistrict: response.subdistrict_th || 'ไม่ทราบ', // ใช้ "ไม่ทราบ" หากไม่พบข้อมูล
            district: response.district_th || 'ไม่ทราบ', // ใช้ "ไม่ทราบ" หากไม่พบข้อมูล
            business_count: response.business_count !== undefined ? response.business_count : -1, // ใช้ -1 หากไม่พบข้อมูล business_count
          });
        },
        error: (error) => {
          console.error('Error fetching economy details:', error);
          if (error.status === 404) {
            loadingOutput.loading = false;
            Object.assign(loadingOutput, {
              subdistrict: 'ไม่ทราบ',  // ถ้าเกิด 404 ให้แสดงว่า "ไม่ทราบ"
              district: 'ไม่ทราบ',    // ถ้าเกิด 404 ให้แสดงว่า "ไม่ทราบ"
              business_count: 0,      // ถ้าเกิด 404 ให้แสดงว่า -1
            });
          }
        },
      });
    }
  }

  private redrawOutput(output: any) {
    if (output.polyline) {
      const polyline = output.polyline;
      polyline.setLatLngs([
        [output.startLat, output.startLon],
        [output.lat, output.lon],
      ]);
    }
    if (output.circle) {
      const circle = output.circle;
      circle.setLatLng([output.startLat, output.startLon]);
      circle.setRadius(output.distance);
    }
    if (output.markers) {
      output.markers.forEach((marker: any, index: number) => {
        marker.setLatLng([
          output.locations[index].lat,
          output.locations[index].lon,
        ]);
      });
    }
    if (output.redMarker) {
      output.redMarker.setLatLng([output.startLat, output.startLon]);
    }
  }

  toggleVisibility(output: any) {
    output.visible = !output.visible;

    if (output.polyline) {
      output.visible
        ? output.polyline.addTo(this.map)
        : output.polyline.remove();
    }
    if (output.circle) {
      output.visible ? output.circle.addTo(this.map) : output.circle.remove();
    }
    if (output.markers) {
      output.markers.forEach((marker: any) => {
        output.visible ? marker.addTo(this.map) : marker.remove();
      });
    }
    if (output.marker && output.marker.getPopup()) {
      if (output.visible) {
        output.marker.openPopup();
      } else {
        output.marker.closePopup();
      }
    }
    if (output.redMarker) {
      if (output.visible && output.redMarker.getPopup()) {
        output.redMarker.openPopup();
      } else if (output.redMarker.getPopup()) {
        output.redMarker.closePopup();
      }
    }
  }

  removeOutput(output: any) {
    const index = this.outputs.indexOf(output);
    if (index > -1) {
      this.outputs.splice(index, 1);

      if (output.polyline) {
        output.polyline.remove();
      }
      if (output.circle) {
        output.circle.remove();
      }
      if (output.markers) {
        output.markers.forEach((marker: any) => {
          marker.remove();
        });
      }
      if (output.marker && output.marker.getPopup()) {
        this.map.closePopup(output.marker.getPopup());
        output.marker.unbindPopup();
      }
      if (output.redMarker) {
        output.redMarker.closePopup();
      }
    }
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      this.searchLocation(query);
    } else {
      this.suggestions = [];
    }
  }

  searchLocation(query: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&countrycodes=TH`;
    this.http.get<any[]>(url).subscribe((data) => {
      this.suggestions = data;
    });
  }

  selectSuggestion(suggestion: any) {
    const lat = suggestion.lat;
    const lon = suggestion.lon;
    this.latInput.nativeElement.value = lat;
    this.lonInput.nativeElement.value = lon;
    this.map.setView([lat, lon], 13);

    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      import('leaflet').then((L) => {
        this.marker = L.marker([lat, lon], { icon: this.redIcon }).addTo(
          this.map
        );
        (this.marker as any).isOutputLayer = true;

        this.marker.on('pm:dragend', () => {
          this.redrawMarker();
        });
      });
    }
    this.suggestions = [];
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  saveMap() {
    this.isMenuOpen = false;
    const drawnLayers: any[] = [];
    this.map.eachLayer((layer: any) => {
      if (layer.pm && layer.pm.getShape && !layer.isOutputLayer) {
        const geoJson = layer.toGeoJSON();
        geoJson.properties = {
          type: layer.pm.getShape(),
          color: layer.options.color,
          radius: layer.getRadius ? layer.getRadius() : null,
          text: layer.options.text ? layer.options.text : null,
        };
        drawnLayers.push(geoJson);
      }
    });

    const combinedOutputs = [...this.outputs].map((output) => {
      const serializedOutput = { ...output };
      if (output.polyline) {
        serializedOutput.polyline = {
          coordinates: output.polyline.getLatLngs(),
        };
      }
      if (output.circle) {
        serializedOutput.circle = {
          coordinates: output.circle.getLatLng(),
          radius: output.circle.getRadius(),
        };
      }
      if (output.markers) {
        serializedOutput.markers = output.markers.map((marker: any) => ({
          lat: marker.getLatLng().lat,
          lon: marker.getLatLng().lng,
        }));
      }
      delete serializedOutput.marker;
      delete serializedOutput.redMarker;
      return serializedOutput;
    });

    const mapData = {
      drawnItems: drawnLayers,
      outputs: combinedOutputs,
    };

    const mapName = prompt('Enter a name for the map:');
    if (mapName) {
      this.apiService.saveUserMap({ name: mapName, data: mapData }).subscribe({
        next: (response) => {
          console.log('Map saved successfully', response);
        },
        error: (error) => console.error('Error saving map:', error),
      });
    }
  }

  loadMap(map: any) {
    console.log('Loading map data:', map);
    this.clearOutputsAndOverlays();

    map.data.drawnItems.forEach((geoJson: any) => {
      import('leaflet').then((L) => {
        let layer;
        switch (geoJson.properties.type) {
          case 'Marker':
            layer = L.marker(geoJson.geometry.coordinates.reverse(), {
              icon: this.blueIcon,
            }).addTo(this.map);
            break;
          case 'Circle':
            layer = L.circle(geoJson.geometry.coordinates.reverse(), {
              radius: geoJson.properties.radius,
              color: geoJson.properties.color,
            }).addTo(this.map);
            break;
          case 'Polygon':
            layer = L.geoJSON(geoJson, {
              style: {
                color: geoJson.properties.color,
              },
            }).addTo(this.map);
            break;
          case 'Polyline':
            layer = L.polyline(
              geoJson.geometry.coordinates.map((coord: any) => coord.reverse()),
              {
                color: geoJson.properties.color,
              }
            ).addTo(this.map);
            break;
          case 'CircleMarker':
            layer = L.circleMarker(geoJson.geometry.coordinates.reverse(), {
              radius: geoJson.properties.radius,
              color: geoJson.properties.color,
              fillColor: geoJson.properties.fillColor,
            }).addTo(this.map);
            break;
          case 'Text':
            const textLatLng = geoJson.geometry.coordinates.reverse();
            const textLayer = L.marker(textLatLng, {
              icon: L.divIcon({
                className: 'text-label',
                html: geoJson.properties.text,
                iconSize: [100, 40],
              }),
              textMarker: true,
              text: geoJson.properties.text,
            }).addTo(this.map);

            const textMarkerLayer = textLayer as L.Marker & {
              options: { text: string };
            };

            textMarkerLayer.pm.enable();
            textMarkerLayer.pm.focus();

            textMarkerLayer.on('pm:textchange', (e: any) => {
              const newText = e.text;
              textMarkerLayer.options.text = newText;
            });

            layer = textMarkerLayer;
            break;
          default:
            layer = L.geoJSON(geoJson).addTo(this.map);
        }

        if (layer) {
          layer.isUserDrawn = true;
          this.markers.push(layer);
          console.log('Created new layer', layer);
        }
      });
    });
    this.outputs = map.data.outputs;
    let markerCreated = false; // Flag to track if redMarker is already created

    this.outputs.forEach((output: any) => {
      if (output.polyline) {
        import('leaflet').then((L) => {
          const polyline = L.polyline(output.polyline.coordinates, {
            color: 'black',
            dashArray: '5, 10',
          }).addTo(this.map);
          polyline.isOutputLayer = true;
          this.polylines.push(polyline);
          output.polyline = polyline;

          polyline.on('pm:dragend', () => {
            this.redrawOutput(output);
          });

          polyline.on('pm:cut', (e: any) => {
            e.layer.remove();
            this.polylines = this.polylines.filter((p) => p !== e.layer);
            this.redrawOutput(output);
            polyline.addTo(this.map);
          });
        });
      }
      if (output.circle) {
        import('leaflet').then((L) => {
          const circle = L.circle(output.circle.coordinates, {
            radius: output.circle.radius,
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.2,
          }).addTo(this.map);
          circle.isOutputLayer = true;
          this.circles.push(circle);
          output.circle = circle;

          circle.on('pm:dragend', () => {
            this.redrawOutput(output);
          });
        });
      }
      if (output.markers) {
        output.markers = output.markers.map((markerData: any) => {
          return import('leaflet').then((L) => {
            const marker = L.marker([markerData.lat, markerData.lon], {
              icon: this.greenIcon,
            }).addTo(this.map);
            marker.isOutputLayer = true;
            this.markers.push(marker);

            marker.on('pm:dragend', () => {
              this.redrawOutput(output);
            });

            return marker;
          });
        });
        Promise.all(output.markers).then((markers) => {
          output.markers = markers;
        });
      }

      // Handle redMarker: Move or create only one redMarker
      if (!markerCreated) {
        import('leaflet').then((L) => {
          const lat = output.startLat ?? output.lat;
          const lon = output.startLon ?? output.lon;

          if (lat !== undefined && lon !== undefined) {
            const latLng: [number, number] = [lat, lon]; // Define as LatLngTuple

            if (this.marker) {
              this.marker.setLatLng(latLng); // Move existing marker
            } else {
              this.marker = L.marker(latLng, {
                icon: this.redIcon,
              }).addTo(this.map);
              (this.marker as any).isOutputLayer = true;
              this.markers.push(this.marker);
            }

            this.latInput.nativeElement.value = lat.toString();
            this.lonInput.nativeElement.value = lon.toString();

            this.marker.on('pm:dragend', () => {
              this.redrawMarker();
            });

            markerCreated = true; // Mark that redMarker is created
          } else {
            console.error('Latitude or Longitude is undefined');
          }
        });
      }

      if (output.type === 'predict') {
        import('leaflet').then((L) => {
          const popupContent = `<div class="predict-info-box">
                    <p>Predicted Amenity Category:</p>
                    <p>${output.predicted_amenity_category}</p>
                </div>`;
          this.marker.bindPopup(output.popupContent, {
            className: 'custom-popup',
          });
          if (output.visible) {
            this.marker.openPopup();
          }
        });
      }
    });
  }

  viewHistory() {
    this.isMenuOpen = false;
    this.router.navigate(['/history']);
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
  }

  loadSelectedMap(mapId: string) {
    const selectedMap = this.savedMaps.find((map) => map.id === mapId);
    if (selectedMap) {
      this.loadMap(selectedMap);
      this.closeHistoryModal();
    }
  }
}
