import {
  Component,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
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
  private marker: any; // Marker to be added on map click
  private tokenCheckInterval: any;
  private navigationSubscription: Subscription | undefined;
  suggestions: any[] = [];
  @ViewChild('latInput') latInput!: ElementRef<HTMLInputElement>;
  @ViewChild('lonInput') lonInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  isSidebarOpen = false;
  selectedAmenity = 'restaurant';
  nearestPlace: any = null;
  private redIcon: any; // Custom red icon

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
    // Subscribe to router events to handle navigation changes
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.initOrReinitMap(); // Reinitialize the map and event listeners on navigation changes
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
      // Dynamically import leaflet in the browser environment
      import('leaflet').then((L) => {
        this.initMap(L);
      });
    }
  }

  private initOrReinitMap() {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then((L) => {
        if (!this.map) {
          // Check if the map instance already exists
          this.initMap(L);
        }
      });
    }
  }

  private initMap(L: any): void {
    // Check if the map container already has a map instance
    const mapContainer = document.getElementById('map');
    if (!mapContainer || (mapContainer && (mapContainer as any)._leaflet_id)) {
      console.log('Map instance already exists');
      return;
    }

    const bounds = [
      [5.0, 97.0], // Southwest coordinates of Thailand
      [21.0, 106.0], // Northeast coordinates of Thailand
    ];

    this.map = L.map('map', {
      center: [15.87, 100.9925],
      zoom: 6,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      dragging: false, // Disable dragging initially
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Limit zoom to the initial size
    this.map.setMinZoom(6);

    // Enable dragging when zooming in
    this.map.on('zoomend', () => {
      if (this.map.getZoom() > 6) {
        this.map.dragging.enable();
      } else {
        this.map.dragging.disable();
      }
    });

    // Define a custom red icon
    this.redIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      iconSize: [25, 41], // size of the icon
      iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
      popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
      shadowSize: [41, 41], // size of the shadow
    });

    // Handle map click events
    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat.toFixed(4);
      const lon = e.latlng.lng.toFixed(4);
      this.latInput.nativeElement.value = lat;
      this.lonInput.nativeElement.value = lon;

      // Add or move marker to the clicked location with custom icon
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng, { icon: this.redIcon }).addTo(
          this.map
        );
      }
    });
  }

  private cleanupMap() {
    if (this.map) {
      this.map.off(); // Remove all event listeners
      this.map.remove(); // Completely remove the map instance
      this.map = null; // Set map instance to null
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
      // Attempt to refresh token if access token is missing but refresh token exists
      this.apiService.refreshToken().subscribe({
        next: () => {},
        error: () => {
          this.router.navigate(['/login']);
        },
      });
    } else if (!accessToken && !refreshToken) {
      // Both tokens are missing, redirect to login
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
    }, 5000); // Check every 5 seconds
  }

  private showSessionExpiredAlert() {
    this.authService.logout();
  }

  logout() {
    // Clear the token check interval
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }

    const refreshToken = this.apiService.getCookie('refresh_token');
    if (refreshToken) {
      this.apiService.logoutUser(refreshToken).subscribe(
        (response) => {
          console.log('Logout successful', response);
          this.apiService.clearToken();
          this.cleanup(); // Ensure map is destroyed
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Logout failed', error);
          this.apiService.clearToken();
          this.cleanup(); // Ensure map is destroyed
          this.router.navigate(['/login']);
        }
      );
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  confirmSelection() {
    const lat = parseFloat(this.latInput.nativeElement.value);
    const lon = parseFloat(this.lonInput.nativeElement.value);
    this.apiService.getNearestPlace(lat, lon, this.selectedAmenity).subscribe({
      next: (response) => {
        this.nearestPlace = response;
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching nearest place:', error);
      },
    });
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      // Start searching after 3 characters
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
    this.map.setView([lat, lon], 13); // Center the map to the selected location

    // Add or move marker to the selected location with custom icon
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      import('leaflet').then((L) => {
        this.marker = L.marker([lat, lon], { icon: this.redIcon }).addTo(
          this.map
        );
      });
    }

    this.suggestions = [];
  }
}

