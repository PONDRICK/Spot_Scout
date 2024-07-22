import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css'],
})
export class OTPVerificationComponent implements OnInit {
  otp: string[] = ['', '', '', '', '', ''];
  email = '';
  errorMessage = '';
  successMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.email = history.state.email; // Get the email from the router state
  }

  verifyOTP() {
    const otp = this.otp.join('');
    this.apiService.verifyOTP({ otp }).subscribe(
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
        this.errorMessage = 'OTP verification failed. Please check your OTP code.';
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

  moveToNext(event: Event, currentIndex: number, nextIndex: number | null, prevIndex: number | null) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && nextIndex !== null) {
      setTimeout(() => {
        const nextInput = document.getElementsByName(`otp${nextIndex}`)[0] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    } else if (input.value.length === 0 && prevIndex !== null) {
      setTimeout(() => {
        const prevInput = document.getElementsByName(`otp${prevIndex}`)[0] as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }, 10);
    }
  }

  handleKeyDown(event: KeyboardEvent, currentIndex: number, prevIndex: number | null, nextIndex: number | null) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && input.value.length === 0 && prevIndex !== null) {
      const prevInput = document.getElementsByName(`otp${prevIndex}`)[0] as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    } else if (event.key === 'ArrowLeft' && prevIndex !== null) {
      const prevInput = document.getElementsByName(`otp${prevIndex}`)[0] as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        setTimeout(() => {
          prevInput.setSelectionRange(1, 1);
        }, 0);
      }
    } else if (event.key === 'ArrowLeft' && prevIndex === null) {
      event.preventDefault(); // Prevent moving the cursor to the left in the first input
    } else if (event.key === 'ArrowRight' && nextIndex !== null) {
      const nextInput = document.getElementsByName(`otp${nextIndex}`)[0] as HTMLInputElement;
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
      const lastInput = document.getElementsByName('otp5')[0] as HTMLInputElement;
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
