import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, BaseChartDirective],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  systemConfig: any;
  activityLogs: any[] = [];
  private tokenCheckInterval: any;
  totalUsers: number = 0;
  totalRoles: number = 0;
  recentActivities: number = 0;

  chartLabels: string[] = ['Statistic 1', 'Statistic 2', 'Statistic 3'];
  chartOptions: ChartOptions = {
    responsive: true,
  };

  usersChartData = {
    labels: this.chartLabels,
    datasets: [{ data: [65, 59, 80], label: 'Users' }],
  };

  rolesChartData = {
    labels: this.chartLabels,
    datasets: [{ data: [28, 48, 40], label: 'Roles' }],
  };

  activitiesChartData = {
    labels: this.chartLabels,
    datasets: [{ data: [35, 72, 50], label: 'Activities' }],
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkSession();
    this.startTokenCheck();
    this.fetchUsers();
    this.fetchRoles();
    this.fetchConfig();
    this.fetchLogs();
  }

  fetchUsers() {
    this.apiService.getUsers().subscribe(
      (response) => {
        this.users = response;
        this.totalUsers = this.users.length;
      },
      (error) => {
        console.error('Failed to fetch users', error);
      }
    );
  }

  fetchRoles() {
    this.apiService.getRoles().subscribe(
      (response) => {
        this.roles = response;
        this.totalRoles = this.roles.length;
      },
      (error) => {
        console.error('Failed to fetch roles', error);
      }
    );
  }

  fetchConfig() {
    this.apiService.getSystemConfig().subscribe(
      (response) => {
        this.systemConfig = response.config;
      },
      (error) => {
        console.error('Failed to fetch system config', error);
      }
    );
  }

  updateConfig() {
    this.apiService.updateSystemConfig(this.systemConfig).subscribe(
      (response) => {
        console.log('System config updated successfully', response);
      },
      (error) => {
        console.error('Failed to update system config', error);
      }
    );
  }

  fetchLogs() {
    this.apiService.getActivityLogs().subscribe(
      (response) => {
        this.activityLogs = response;
        this.recentActivities = this.activityLogs.length;
      },
      (error) => {
        console.error('Failed to fetch activity logs', error);
      }
    );
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
}
