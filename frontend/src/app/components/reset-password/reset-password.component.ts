// src/app/components/reset-password/reset-password.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  email = '';

  constructor(private apiService: ApiService) {}

  resetPassword() {
    this.apiService.resetPassword({ email: this.email }).subscribe(
      (response) => {
        console.log('Reset password email sent', response);
      },
      (error) => {
        console.error('Reset password failed', error);
      }
    );
  }
}
