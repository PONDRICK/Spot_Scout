import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../shared.service'; // Import the shared service

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  savedMaps: any[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private sharedService: SharedService // Inject the shared service
  ) {}

  ngOnInit(): void {
    this.apiService.getUserMaps().subscribe({
      next: (maps) => {
        this.savedMaps = maps;
      },
      error: (error) => console.error('Error fetching saved maps:', error),
    });
  }

  loadMap(map: any) {
    console.log('Navigating to dashboard with map data:', map);
    this.sharedService.setMapData(map); // Set the map data in the shared service
    this.router.navigate(['/dashboard']);
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
}
