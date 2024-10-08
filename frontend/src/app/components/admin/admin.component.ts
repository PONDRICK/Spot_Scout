import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, BaseChartDirective,MatIconModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  userSearchTerm: string = '';
  isMenuOpen: boolean = false;


  roles: any[] = [];

  systemConfig: any;
  activityLogs: any[] = [];
  filteredLogs: any[] = [];
  logSearchTerm: string = '';

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
    private router: Router,
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

  banUser(userId: number) {
  // First, trigger sending OTP to verify identity before banning
  this.apiService.sendOtp().subscribe(
    (response) => {
      Swal.fire({
        title: 'Enter OTP',
        input: 'text',
        inputPlaceholder: 'Enter OTP sent to your email',
        showCancelButton: true,
        confirmButtonText: 'Verify OTP',
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.verifyOtp(result.value, () => {
            // If OTP is verified, proceed with banning the user
            this.apiService.banUser(userId).subscribe(
              () => {
                Swal.fire('Banned!', 'The user has been banned.', 'success');
                this.fetchUsers(); // Refresh the user list
              },
              (error) => {
                Swal.fire('Error!', 'Failed to ban user.', 'error');
              }
            );
          });
        }
      });
    },
    (error) => {
      Swal.fire('Error!', 'Failed to send OTP.', 'error');
    }
  );
}

deleteUser(userId: number) {
  // Trigger OTP verification for deleting a user
  this.apiService.sendOtp().subscribe(
    (response) => {
      Swal.fire({
        title: 'Enter OTP',
        input: 'text',
        inputPlaceholder: 'Enter OTP sent to your email',
        showCancelButton: true,
        confirmButtonText: 'Verify OTP',
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.verifyOtp(result.value, () => {
            // If OTP is verified, proceed with deleting the user
            this.apiService.deleteUser(userId).subscribe(
              () => {
                Swal.fire('Deleted!', 'The user has been deleted.', 'success');
                this.fetchUsers(); // Refresh the user list
              },
              (error) => {
                Swal.fire('Error!', 'Failed to delete user.', 'error');
              }
            );
          });
        }
      });
    },
    (error) => {
      Swal.fire('Error!', 'Failed to send OTP.', 'error');
    }
  );
}

verifyOtp(otp: string, callback: Function) {
  this.apiService.verifyOtp({ otp }).subscribe(
    (response) => {
      callback(); // Proceed with action after OTP is verified
    },
    (error) => {
      Swal.fire('Invalid OTP', 'The OTP you entered is invalid', 'error');
    }
  );
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

  navigateToDashboard() {
    this.router.navigate(['/dashboard']); // Programmatically navigate to the dashboard
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
