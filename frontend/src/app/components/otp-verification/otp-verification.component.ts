import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css'],
})
export class OTPVerificationComponent implements OnInit, OnDestroy {
  otp: string[] = ['', '', '', '', '', ''];
  email = '';
  errorMessage = '';
  successMessage = '';
  expirationTime: Date | null = null;
  timeLeft: number = 0;
  timerSubscription: Subscription | null = null;
  token: string = '';
  resendCooldown: number = 0;
  resendTimerSubscription: Subscription | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.email = history.state.email; // Get the email from the router state

    // Get the token from the route parameters
    this.route.params.subscribe((params) => {
      this.token = params['token'];
      // Fetch OTP expiration time
      this.apiService.getOTPExpiration(this.token).subscribe(
        (response) => {
          this.expirationTime = new Date(response.expiration_time);
          this.startCountdown();
        },
        (error) => {
          this.errorMessage = 'Failed to fetch OTP expiration time';
          console.error('Failed to fetch OTP expiration time', error);
        }
      );
    });
  }

  ngOnDestroy() {
    this.clearCountdown();
    this.clearResendCooldown();
  }

  startResendCooldown() {
    this.clearResendCooldown();
    this.resendTimerSubscription = interval(1000).subscribe(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        this.clearResendCooldown();
      }
    });
  }
  
  clearResendCooldown() {
    if (this.resendTimerSubscription) {
      this.resendTimerSubscription.unsubscribe();
      this.resendTimerSubscription = null;
    }
  }

  startCountdown() {
    this.clearCountdown();
    if (this.expirationTime) {
      this.timeLeft = Math.floor(
        (this.expirationTime.getTime() - new Date().getTime()) / 1000
      );
      this.timerSubscription = interval(1000).subscribe(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.clearCountdown();
          this.errorMessage = 'OTP has expired. Please request a new one.';
        }
      });
    }
  }

  clearCountdown() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  formatTimeLeft(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} minutes`;
  }

  verifyOTP() {
    const otp = this.otp.join('');
    this.apiService.verifyOTP({ otp }, this.token).subscribe(
      (response) => {
        console.log('OTP verification successful', response);
        Swal.fire({
          icon: 'success',
          title: 'OTP Verification Successful',
          text: 'Your OTP has been successfully verified.',
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      (error) => {
        console.error('OTP verification failed', error);
        this.errorMessage =
          'OTP verification failed. Please check your OTP code.';
      }
    );
  }

  resendOTP() {
    if (this.resendCooldown > 0) {
      this.errorMessage = `Please wait before resending OTP.`;
      return;
    }
  
    this.apiService.resendOTP({ token: this.token }).subscribe(
      (response) => {
        console.log('OTP resent successfully', response);
        this.successMessage = 'OTP has been resent. Please check your email.';
        this.errorMessage = ''; // Clear error message when OTP is resent
  
        // Handle expiration time
        if (response.expiration_time) {
          this.expirationTime = new Date(response.expiration_time);
          this.startCountdown();
        }
  
        // Handle cooldown time
        if (response.time_left) {
          this.resendCooldown = response.time_left;
          this.startResendCooldown();
        } else {
          // If no cooldown time is provided, default to 30 seconds
          this.resendCooldown = 30;
          this.startResendCooldown();
        }
  
        // Update the token if it's included in the response
        if (response.token) {
          this.token = response.token;
          // Update the URL with the new token without navigating
          const newUrl = `${location.protocol}//${location.host}${location.pathname.replace(/\/[^\/]*$/, '')}/${this.token}`;
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }
      },
      (error) => {
        console.error('Resend OTP failed', error);
        if (error.status === 429 && error.error.time_left) {
          this.resendCooldown = error.error.time_left;
          this.startResendCooldown();
          this.errorMessage = `Please wait before resending OTP.`;
        } else {
          this.errorMessage = 'Resend OTP failed. Please try again.';
        }
      }
    );
  }

  moveToNext(
    event: Event,
    currentIndex: number,
    nextIndex: number | null,
    prevIndex: number | null
  ) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && nextIndex !== null) {
      setTimeout(() => {
        const nextInput = document.getElementsByName(
          `otp${nextIndex}`
        )[0] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    } else if (input.value.length === 0 && prevIndex !== null) {
      setTimeout(() => {
        const prevInput = document.getElementsByName(
          `otp${prevIndex}`
        )[0] as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }, 10);
    }
  }

  handleKeyDown(
    event: KeyboardEvent,
    currentIndex: number,
    prevIndex: number | null,
    nextIndex: number | null
  ) {
    const input = event.target as HTMLInputElement;
    if (
      event.key === 'Backspace' &&
      input.value.length === 0 &&
      prevIndex !== null
    ) {
      const prevInput = document.getElementsByName(
        `otp${prevIndex}`
      )[0] as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    } else if (event.key === 'ArrowLeft' && prevIndex !== null) {
      const prevInput = document.getElementsByName(
        `otp${prevIndex}`
      )[0] as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        setTimeout(() => {
          prevInput.setSelectionRange(1, 1);
        }, 0);
      }
    } else if (event.key === 'ArrowLeft' && prevIndex === null) {
      event.preventDefault(); // Prevent moving the cursor to the left in the first input
    } else if (event.key === 'ArrowRight' && nextIndex !== null) {
      const nextInput = document.getElementsByName(
        `otp${nextIndex}`
      )[0] as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    if (clipboardData.length === 6 && /^\d+$/.test(clipboardData)) {
      for (let i = 0; i < 6; i++) {
        this.otp[i] = clipboardData[i];
      }
      // Move focus to the last input
      const lastInput = document.getElementsByName(
        'otp5'
      )[0] as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }
  }

  restrictToNumbers(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.keyCode);
    if (!/[0-9]/.test(inputChar)) {
      event.preventDefault();
    }
  }
}
