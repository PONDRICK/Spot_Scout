import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-set-new-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.css'],
})
export class SetNewPasswordComponent {
  password = '';
  confirmPassword = '';
  passwordLengthValid = false;
  passwordUppercaseValid = false;
  passwordLowercaseValid = false;
  passwordDigitValid = false;
  passwordSpecialCharValid = false;
  confirmPasswordError = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  validatePassword() {
    this.passwordLengthValid = this.password.length >= 8;
    this.passwordUppercaseValid = /[A-Z]/.test(this.password);
    this.passwordLowercaseValid = /[a-z]/.test(this.password);
    this.passwordDigitValid = /\d/.test(this.password);
    this.passwordSpecialCharValid = /[\W_]/.test(this.password);
  }

  validateConfirmPassword() {
    this.confirmPasswordError = this.password !== this.confirmPassword;
  }

  setNewPassword() {
    this.validatePassword();
    this.validateConfirmPassword();

    if (
      !this.passwordLengthValid ||
      !this.passwordUppercaseValid ||
      !this.passwordLowercaseValid ||
      !this.passwordDigitValid ||
      !this.passwordSpecialCharValid ||
      this.confirmPasswordError
    ) {
      this.errorMessage = 'Please correct the errors above.';
      return;
    }

    const uidb64 = this.route.snapshot.paramMap.get('uidb64');
    const token = this.route.snapshot.paramMap.get('token');
    this.apiService
      .setNewPassword({
        password: this.password,
        confirm_password: this.confirmPassword,
        uidb64,
        token,
      })
      .subscribe(
        (response) => {
          console.log('Password reset successful', response);
          Swal.fire({
            icon: 'success',
            title: 'Password Reset Successful',
            text: 'You can now login with your new password.',
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        (error) => {
          console.error('Password reset failed', error);
          this.errorMessage =
            'Password reset failed. The link might have expired or is invalid.';
        }
      );
  }
}
