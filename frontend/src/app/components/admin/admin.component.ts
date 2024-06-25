import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  users: any[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.apiService.getUsers().subscribe(
      (response) => {
        this.users = response;
      },
      (error) => {
        console.error('Failed to fetch users', error);
      }
    );
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
          this.apiService.clearToken();
          this.router.navigate(['/login']);
        }
      );
    }
  }
}
