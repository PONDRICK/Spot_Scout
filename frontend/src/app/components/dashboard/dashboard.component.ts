import { Component, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit {
  private map: any;
  @ViewChild('latInput') latInput!: ElementRef<HTMLInputElement>;
  @ViewChild('lonInput') lonInput!: ElementRef<HTMLInputElement>;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Dynamically import leaflet in the browser environment
      import('leaflet').then(L => {
        this.initMap(L);
      });
    }
  }

  private initMap(L: any): void {
    const bounds = [
      [5.0, 97.0],  // Southwest coordinates of Thailand
      [21.0, 106.0] // Northeast coordinates of Thailand
    ];

    this.map = L.map('map', {
      center: [15.8700, 100.9925],
      zoom: 6,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      dragging: false // ปิดการลากแผนที่เมื่อเริ่มต้น
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // จำกัดการซูมเข้าไปเท่ากับขนาดตอนเริ่มต้น
    this.map.setMinZoom(6);

    // เมื่อทำการซูมเข้า ให้เปิดใช้งานการลากแผนที่
    this.map.on('zoomend', () => {
      if (this.map.getZoom() > 6) {
        this.map.dragging.enable();
      } else {
        this.map.dragging.disable();
      }
    });

    // เมื่อคลิกที่แผนที่
    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat.toFixed(4);
      const lon = e.latlng.lng.toFixed(4);
      this.latInput.nativeElement.value = lat;
      this.lonInput.nativeElement.value = lon;
    });
  }

  logout() {
    const refreshToken = this.apiService.getCookie('refresh_token');
    if (refreshToken) {
      this.apiService.logoutUser(refreshToken).subscribe(
        (response) => {
          console.log('Logout successful', response);
          this.apiService.clearToken();
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Logout failed', error);
        }
      );
    }
  }
}
