import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterOutlet } from '@angular/router';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink, RouterOutlet],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  };
  acceptedPolicy = false;
  showPrivacyPolicy = false;
  showTerms = false;
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  validatePassword(password: string): string | null {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }
    if (!/[\W_]/.test(password)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  }

  register() {
    if (this.user.password !== this.user.password2) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const passwordError = this.validatePassword(this.user.password);
    if (passwordError) {
      this.errorMessage = passwordError;
      return;
    }

    this.apiService.registerUser(this.user).subscribe(
      (response) => {
        console.log('Registration successful', response);
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: 'An OTP has been sent to your email address.',
        }).then(() => {
          this.router.navigate(['/verify-otp', response.token], {
            state: {
              email: this.user.email,
              expirationTime: response.expiration_time,
            },
          });
        });
      },
      (error) => {
        console.error('Registration failed', error);
        if (error.error.email) {
          this.errorMessage = 'Invalid email address.';
        } else {
          this.errorMessage =
            'Registration failed. Please check the entered details.';
        }
      }
    );
  }

  openPrivacyPolicy(event: Event) {
    event.preventDefault(); // Prevent default link behavior
    this.showPrivacyPolicy = true;
  }

  closePrivacyPolicy() {
    this.showPrivacyPolicy = false;
  }

  openTerms(event: Event) {
    event.preventDefault();
    this.showTerms = true;
  }

  closeTerms() {
    this.showTerms = false;
  }
}
