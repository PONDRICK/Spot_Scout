import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

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
    private router: Router
  ) {}

  ngOnInit() {
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

  deleteUser(userId: number) {
    this.apiService.deleteUser(userId).subscribe(
      () => {
        this.users = this.users.filter((user) => user.id !== userId);
        this.totalUsers = this.users.length;
      },
      (error) => {
        console.error('Failed to delete user', error);
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
