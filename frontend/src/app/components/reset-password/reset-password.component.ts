import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  email = '';
  successMessage = '';
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  resetPassword() {
    this.apiService.resetPassword({ email: this.email }).subscribe(
      (response) => {
        console.log('Reset password email sent', response);
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'A link to reset your password has been sent to your email.',
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      (error) => {
        console.error('Reset password failed', error);
        if (error.error.email) {
          this.errorMessage = 'This email address is not registered.';
        } else {
          this.errorMessage = 'Reset password failed. Please check your email.';
        }
      }
    );
  }
}
