import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css'],
})
export class OTPVerificationComponent implements OnInit {
  otp = '';
  email = ''; // Add this line to store email
  errorMessage = '';
  successMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.email = history.state.email; // Get the email from the router state
  }

  verifyOTP() {
    this.apiService.verifyOTP({ otp: this.otp }).subscribe(
      (response) => {
        console.log('OTP verification successful', response);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('OTP verification failed', error);
        this.errorMessage =
          'OTP verification failed. Please check your OTP code.';
      }
    );
  }

  resendOTP() {
    this.apiService.resendOTP({ email: this.email }).subscribe(
      (response) => {
        console.log('OTP resent successfully', response);
        this.successMessage = 'OTP has been resent. Please check your email.';
      },
      (error) => {
        console.error('Resend OTP failed', error);
        this.errorMessage = 'Resend OTP failed. Please try again.';
      }
    );
  }
}
