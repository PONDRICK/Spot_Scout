import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  savedMaps: any[] = [];
  filteredMaps: any[] = [];
  searchText: string = '';
  isMenuOpen: boolean = false;
  showTerms = false;
  showPrivacyPolicy = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.apiService.getUserMaps().subscribe({
      next: (maps) => {
        this.savedMaps = maps.map((map: any) => {
          if (map.data && map.data.outputs && map.data.outputs.length > 0) {
            const mainCoordinates = map.data.outputs[0];
            return {
              ...map,
              startLat: mainCoordinates.startLat || 'N/A',
              startLon: mainCoordinates.startLon || 'N/A'
            };
          }
          return map;
        });
        this.filteredMaps = this.savedMaps; // Initially, all maps are shown
      },
      error: (error) => console.error('Error fetching saved maps:', error),
    });
  }

  // Method to navigate to the dashboard
  navigateToDashboard() {
    this.router.navigate(['/dashboard']); // Programmatically navigate to the dashboard
  }

  onSearchInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredMaps = this.savedMaps.filter(map =>
      map.name.toLowerCase().includes(query)
    );
  }

  loadMap(map: any) {
    console.log('Navigating to dashboard with map data:', map);
    this.sharedService.setMapData(map);
    this.router.navigate(['/dashboard']);
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  deleteMap(mapId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this map? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUserMap(mapId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The map has been deleted.', 'success');
            this.savedMaps = this.savedMaps.filter((map) => map.id !== mapId);
            this.filteredMaps = this.filteredMaps.filter((map) => map.id !== mapId);
          },
          error: (error) => {
            Swal.fire('Error', 'There was an issue deleting the map.', 'error');
            console.error('Error deleting map:', error);
          },
        });
      }
    });
  }

  logout() {
    const refreshToken = this.apiService.getCookie('refresh_token');
    if (refreshToken) {
      this.apiService.logoutUser(refreshToken).subscribe(
        (response) => {
          console.log('Logout successful', response);
          this.apiService.clearToken();
          this.navigateAfterLogout();
        },
        (error) => {
          console.error('Logout failed', error);
          this.apiService.clearToken();
          this.navigateAfterLogout();
        }
      );
    }
  }

  private navigateAfterLogout() {
    window.location.replace('/login');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  openTerms() {
    this.isMenuOpen = false;  // ปิดเมนูเมื่อคลิก
    this.showTerms = true;
  }

  openPrivacyPolicy() {
    this.isMenuOpen = false;  // ปิดเมนูเมื่อคลิก
    this.showPrivacyPolicy = true;
  }

  closeTerms() {
    this.showTerms = false;
  }

  closePrivacyPolicy() {
    this.showPrivacyPolicy = false;
  }

}
