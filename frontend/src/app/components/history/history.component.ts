import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service'; // Import the shared service
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule], // Add MatIconModule here
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  savedMaps: any[] = [];
  filteredMaps: any[] = []; // Filtered maps based on search input
  isMenuOpen = false; // For the hamburger menu


  constructor(
    private apiService: ApiService,
    private router: Router,
    private sharedService: SharedService // Inject the shared service
  ) {}

  ngOnInit(): void {
    this.apiService.getUserMaps().subscribe({
      next: (maps) => {
        // Log the data to verify if the API is returning the correct structure
        console.log('Maps data:', maps);
        
        // Process each map and extract the startLat and startLon if they exist
        this.savedMaps = maps.map((map: any) => {
          if (map.data && map.data.outputs && map.data.outputs.length > 0) {
            const mainCoordinates = map.data.outputs[0];  // Assuming you want the first set of coordinates
            return {
              ...map,
              startLat: mainCoordinates.startLat || 'N/A', // Fallback to 'N/A' if missing
              startLon: mainCoordinates.startLon || 'N/A'  // Fallback to 'N/A' if missing
            };
          }
          return map;
        });
      },
      error: (error) => console.error('Error fetching saved maps:', error),
    });
  }
  
  loadMap(map: any) {
    console.log('Navigating to dashboard with map data:', map);
    this.sharedService.setMapData(map); // Set the map data in the shared service
    this.router.navigate(['/dashboard']);
  }

  // Function to handle search input
  onSearchInput(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredMaps = this.savedMaps.filter((map) =>
      map.name.toLowerCase().includes(searchTerm)
    );
  }
  
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  deleteMap(mapId: number) {
    this.apiService.deleteUserMap(mapId).subscribe({
      next: () => {
        this.savedMaps = this.savedMaps.filter((map) => map.id !== mapId);
      },
      error: (error) => console.error('Error deleting map:', error),
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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  private navigateAfterLogout() {
    window.location.replace('/login');
  }
  
}
