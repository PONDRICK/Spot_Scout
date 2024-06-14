import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterLink,
    RouterOutlet,
  ],
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
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  register() {
    this.apiService.registerUser(this.user).subscribe(
      (response) => {
        console.log('Registration successful', response);
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: 'An OTP has been sent to your email address.',
        }).then(() => {
          this.router.navigate(['/verify-otp'], {
            state: { email: this.user.email },
          });
        });
      },
      (error) => {
        console.error('Registration failed', error);
        this.errorMessage =
          'Registration failed. Please check the entered details.';
      }
    );
  }
}
