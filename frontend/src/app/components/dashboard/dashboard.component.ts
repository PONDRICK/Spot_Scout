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
import { ApiService } from '../../services/api.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service'; // Import the shared service

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
  private blueIcon: any; // Add blue icon
  isMarkerLocked = false;

  showHistoryModal = false;
  savedMaps: any[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private http: HttpClient,
    private sharedService: SharedService, // Inject the shared service
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.checkSession();
    this.startTokenCheck();

    const mapData = this.sharedService.getMapData();
    if (mapData) {
      console.log('Received map data in ngOnInit:', mapData);
      // Initialize or reinitialize map and ensure it's complete before loading map data
      this.initOrReinitMap().then(() => {
        this.loadMap(mapData);
        this.sharedService.clearMapData(); // Clear the map data after loading
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
    }
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
        this.latInput.nativeElement.value = lat;
        this.lonInput.nativeElement.value = lon;

        this.clearOutputsAndOverlays();

        if (this.marker) {
          this.marker.setLatLng(e.latlng);
        } else {
          this.marker = L.marker(e.latlng, { icon: this.redIcon }).addTo(
            this.map
          );
          (this.marker as any).isOutputLayer = true;
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
    }, 300000);
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
        (this.marker as any).isOutputLayer = true; // Ensure the marker has the unique identifier
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
      startLat: lat, // Save the starting lat
      startLon: lon, // Save the starting lon
    };
    this.outputs.unshift(loadingOutput);

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
                { color: 'black', dashArray: '5, 10' } // Dashed line pattern
              ).addTo(this.map);
              (polyline as any).isOutputLayer = true; // Mark as output layer
              this.polylines.push(polyline);
              loadingOutput.loading = false;
              Object.assign(loadingOutput, {
                amenity: response.amenity,
                distance: response.distance,
                province: response.province,
                lat: response.lat,
                lon: response.lon,
                polyline: polyline,
                startLat: lat, // Save the starting lat
                startLon: lon, // Save the starting lon
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
            import('leaflet').then((L) => {
              const circle = L.circle([lat, lon], {
                radius: this.distance,
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.2,
              }).addTo(this.map);
              (circle as any).isOutputLayer = true; // Mark as output layer
              this.circles.push(circle);
              const markers = response.locations.map((location: any) => {
                const marker = L.marker([location.lat, location.lon], {
                  icon: this.greenIcon,
                }).addTo(this.map);
                (marker as any).isOutputLayer = true; // Mark as output layer
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
            });
          },
          error: (error) => console.error('Error counting amenities:', error),
        });
    } else if (this.selectedFunction === 'population') {
      this.apiService.getPopulation(lat, lon, this.distance).subscribe({
        next: (response) => {
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

              // Debugging: Log top3Predictions to ensure it's correctly formatted
              console.log('Top 3 Predictions:', top3Predictions);

              const predictionHtml = top3Predictions
                .map((pred: { category: string; score: number }) => {
                  // Safeguard against undefined properties
                  const category = pred.category ? pred.category : 'Unknown';
                  const score = pred.score
                    ? (pred.score * 100).toFixed(2)
                    : '0.00';
                  return `<p>${category} : ${score}%</p>`;
                })
                .join('');

              const popupContent = `
                            <div class="predict-info-box">
                                <h3>Predicted Amenity Category:</h3>
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
                popupContent: popupContent, // Save popup content to output
              });
            } else {
              console.error('Invalid response format:', response);
            }
          });
        },
        error: (error) => console.error('Error predicting model:', error),
      });
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
        (this.marker as any).isOutputLayer = true; // Ensure the marker has the unique identifier
      });
    }
    this.suggestions = []; // Clear the suggestions array
  }

  // Save and Load Map Functions
  saveMap() {
    // Gather only user-drawn layers from the map
    const drawnLayers: any[] = [];
    this.map.eachLayer((layer: any) => {
      if (layer.pm && layer.pm.getShape && !layer.isOutputLayer) {
        const geoJson = layer.toGeoJSON();
        geoJson.properties = {
          type: layer.pm.getShape(),
          color: layer.options.color,
          radius: layer.getRadius ? layer.getRadius() : null,
          text: layer.options.text ? layer.options.text : null, // Save the text content
        };
        drawnLayers.push(geoJson);
      }
    });

    // Combine outputs from the current session and loaded outputs
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
      // Remove the marker reference to avoid circular reference
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
          layer.isUserDrawn = true; // Mark this layer as user-drawn
          this.markers.push(layer);
          console.log('Created new layer', layer); // Log layer creation
        }
      });
    });

    this.outputs = map.data.outputs;
    this.outputs.forEach((output: any) => {
      if (output.polyline) {
        import('leaflet').then((L) => {
          const polyline = L.polyline(output.polyline.coordinates, {
            color: 'black',
            dashArray: '5, 10',
          }).addTo(this.map);
          polyline.isOutputLayer = true; // Mark as output layer
          this.polylines.push(polyline);
          output.polyline = polyline;
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
          circle.isOutputLayer = true; // Mark as output layer
          this.circles.push(circle);
          output.circle = circle;
        });
      }
      if (output.markers) {
        output.markers = output.markers.map((markerData: any) => {
          return import('leaflet').then((L) => {
            const marker = L.marker([markerData.lat, markerData.lon], {
              icon: this.greenIcon,
            }).addTo(this.map);
            marker.isOutputLayer = true; // Mark as output layer
            this.markers.push(marker);
            return marker;
          });
        });
        Promise.all(output.markers).then((markers) => {
          output.markers = markers;
        });
      }
      if (output.startLat && output.startLon) {
        import('leaflet').then((L) => {
          const redMarker = L.marker([output.startLat, output.startLon], {
            icon: this.redIcon,
          }).addTo(this.map);
          redMarker.isOutputLayer = true; // Mark as output layer
          this.markers.push(redMarker);
          output.redMarker = redMarker;
          this.latInput.nativeElement.value = output.startLat;
          this.lonInput.nativeElement.value = output.startLon;
        });
      } else {
        import('leaflet').then((L) => {
          const redMarker = L.marker([output.lat, output.lon], {
            icon: this.redIcon,
          }).addTo(this.map);
          redMarker.isOutputLayer = true; // Mark as output layer
          this.markers.push(redMarker);
          output.redMarker = redMarker;
          this.latInput.nativeElement.value = output.lat;
          this.lonInput.nativeElement.value = output.lon;
        });
      }

      if (output.type === 'predict') {
        import('leaflet').then((L) => {
          const popupContent = `<div class="predict-info-box">
            <h3>Predicted Amenity Category:</h3>
            <p>${output.predicted_amenity_category}</p>
          </div>`;
          if (output.redMarker) {
            output.redMarker.bindPopup(output.popupContent, {
              className: 'custom-popup',
            });
            if (output.visible) {
              output.redMarker.openPopup();
            }
          } else {
            const redMarker = L.marker([output.lat, output.lon], {
              icon: this.redIcon,
            })
              .addTo(this.map)
              .bindPopup(output.popupContent, { className: 'custom-popup' });
            redMarker.isOutputLayer = true; // Mark as output layer
            this.markers.push(redMarker);
            output.redMarker = redMarker;
            if (output.visible) {
              redMarker.openPopup();
            }
          }
        });
      }
    });
  }

  viewHistory() {
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
