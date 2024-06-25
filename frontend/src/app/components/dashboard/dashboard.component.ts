import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../api.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../auth.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit, OnInit, OnDestroy {
  private map: any;
  private marker: any;
  private polylines: any[] = [];
  private circles: any[] = [];
  private markers: any[] = [];
  private tokenCheckInterval: any;
  private navigationSubscription: Subscription | undefined;
  suggestions: any[] = [];
  @ViewChild('latInput') latInput!: ElementRef<HTMLInputElement>;
  @ViewChild('lonInput') lonInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  isSidebarOpen = false;
  selectedFunction = 'nearest';
  selectedAmenity = 'restaurant';
  outputs: any[] = [];
  distance = 1000; // Default distance
  private redIcon: any;
  private greenIcon: any; // Add green icon
  isMarkerLocked = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.checkSession();
    this.startTokenCheck();
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
    }
  }

  private initOrReinitMap() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  private async loadLeaflet() {
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

    this.map.on('click', (e: any) => {
      if (this.isSidebarOpen && !this.isMarkerLocked) {
        const lat = e.latlng.lat.toFixed(4);
        const lon = e.latlng.lng.toFixed(4);
        this.latInput.nativeElement.value = lat;
        this.lonInput.nativeElement.value = lon;

        if (this.marker) {
          this.marker.setLatLng(e.latlng);
        } else {
          this.marker = L.marker(e.latlng, { icon: this.redIcon }).addTo(
            this.map
          );
        }

        // Clear all outputs and overlays
        this.clearOutputsAndOverlays();
      }
    });

    this.map.pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawPolygon: true,
      drawPolyline: true,
      drawCircle: true,
      drawRectangle: true,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
    });

    this.map.on('pm:create', (e: any) => {
      const layer = e.layer;
      console.log('Created new layer', layer);
    });
  }

  private clearOutputsAndOverlays() {
    this.outputs = [];
    this.polylines.forEach((polyline) => polyline.remove());
    this.polylines = [];
    this.circles.forEach((circle) => circle.remove());
    this.circles = [];
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
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
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    this.cleanupMap();
  }

  private checkSession() {
    const accessToken = this.cookieService.get('access_token');
    const refreshToken = this.cookieService.get('refresh_token');
    if (!accessToken && refreshToken) {
      this.apiService.refreshToken().subscribe({
        next: () => {},
        error: () => {
          this.router.navigate(['/login']);
        },
      });
    } else if (!accessToken && !refreshToken) {
      this.router.navigate(['/login']);
    }
  }

  private startTokenCheck() {
    this.tokenCheckInterval = setInterval(() => {
      if (this.authService.isAccessTokenExpired()) {
        this.apiService.refreshToken().subscribe({
          next: () => {},
          error: () => {
            if (this.authService.isRefreshTokenExpired()) {
              this.showSessionExpiredAlert();
            }
          },
        });
      } else if (this.authService.isRefreshTokenExpired()) {
        this.showSessionExpiredAlert();
      }
    }, 5000);
  }

  private showSessionExpiredAlert() {
    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: 'Your session has expired. Please log in again.',
      confirmButtonText: 'OK',
    }).then(() => {
      this.authService.logout();
      this.navigateAfterLogout();
    });
  }

  logout() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }

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

  confirmSelection() {
    const lat = parseFloat(this.latInput.nativeElement.value);
    const lon = parseFloat(this.lonInput.nativeElement.value);

    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      import('leaflet').then((L) => {
        this.marker = L.marker([lat, lon], { icon: this.redIcon }).addTo(
          this.map
        );
      });
    }

    this.map.setView([lat, lon], this.map.getZoom());

    if (this.selectedFunction === 'nearest') {
      this.apiService
        .getNearestPlace(lat, lon, this.selectedAmenity)
        .subscribe({
          next: (response) => {
            import('leaflet').then((L) => {
              const polyline = L.polyline(
                [
                  [lat, lon],
                  [response.lat, response.lon],
                ],
                { color: 'black' }
              ).addTo(this.map);

              this.polylines.push(polyline);

              const nearestPlaceOutput = {
                type: 'nearest',
                amenity: response.amenity,
                distance: response.distance,
                province: response.province,
                lat: response.lat,
                lon: response.lon,
                polyline: polyline,
              };

              this.outputs.unshift(nearestPlaceOutput);
            });
          },
          error: (error) => {
            console.error('Error fetching nearest place:', error);
          },
        });
    } else if (this.selectedFunction === 'count') {
      this.apiService
        .countAmenities(lat, lon, this.selectedAmenity, this.distance)
        .subscribe({
          next: (response) => {
            import('leaflet').then((L) => {
              const circle = L.circle([lat, lon], {
                radius: this.distance,
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.2,
              }).addTo(this.map);

              this.circles.push(circle);

              const markers = response.locations.map((location: any) => {
                const marker = L.marker([location.lat, location.lon], {
                  icon: this.greenIcon,
                }).addTo(this.map);
                this.markers.push(marker);
                return marker;
              });

              const amenitiesCountOutput = {
                type: 'count',
                count: response.count,
                locations: response.locations,
                circle: circle,
                markers: markers,
              };

              this.outputs.unshift(amenitiesCountOutput);
            });
            console.log(response);
          },
          error: (error) => {
            console.error('Error counting amenities:', error);
          },
        });
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
      });
    }
  }
}
