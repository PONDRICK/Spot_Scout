import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
  errorMessage = '';
  successMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  setNewPassword() {
    const uidb64 = this.route.snapshot.paramMap.get('uidb64');
    const token = this.route.snapshot.paramMap.get('token');
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords don't match";
      return;
    }
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
          this.successMessage =
            'Password has been reset successfully. You can now login with your new password.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        (error) => {
          console.error('Password reset failed', error);
          this.errorMessage =
            'Password reset failed. The link might have expired or is invalid.';
        }
      );
  }
}
