// admin.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
  filteredUsers: any[] = [];
  userSearchTerm: string = '';

  roles: any[] = [];

  systemConfig: any;
  activityLogs: any[] = [];
  filteredLogs: any[] = [];
  logSearchTerm: string = '';

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
        this.filteredUsers = response;
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
        this.filteredLogs = response;
        this.recentActivities = this.activityLogs.length;
      },
      (error) => {
        console.error('Failed to fetch activity logs', error);
      }
    );
  }

  searchUsers() {
    this.filteredUsers = this.users.filter(
      (user) =>
        user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
        user.first_name
          .toLowerCase()
          .includes(this.userSearchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.userSearchTerm.toLowerCase())
    );
  }

  searchLogs() {
    this.filteredLogs = this.activityLogs.filter(
      (log) =>
        log.user_email
          .toLowerCase()
          .includes(this.logSearchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(this.logSearchTerm.toLowerCase())
    );
  }

  deleteUser(userId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUser(userId).subscribe(
          () => {
            Swal.fire('Deleted!', 'The user has been deleted.', 'success');
            this.fetchUsers(); // Refresh the user list
          },
          (error) => {
            Swal.fire('Error!', 'Failed to delete user.', 'error');
          }
        );
      }
    });
  }

  banUser(userId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will ban this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, ban it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.banUser(userId).subscribe(
          () => {
            Swal.fire('Banned!', 'The user has been banned.', 'success');
            this.fetchUsers(); // Refresh the user list
          },
          (error) => {
            Swal.fire('Error!', 'Failed to ban user.', 'error');
          }
        );
      }
    });
  }

  unbanUser(userId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will unban this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unban it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.unbanUser(userId).subscribe(
          () => {
            Swal.fire('Unbanned!', 'The user has been unbanned.', 'success');
            this.fetchUsers(); // Refresh the user list
          },
          (error) => {
            Swal.fire('Error!', 'Failed to unban user.', 'error');
          }
        );
      }
    });
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
