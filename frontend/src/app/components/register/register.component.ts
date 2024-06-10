import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  };

  constructor(private apiService: ApiService) {}

  register() {
    this.apiService.registerUser(this.user).subscribe(
      (response) => {
        console.log('Registration successful', response);
      },
      (error) => {
        console.error('Registration failed', error);
      }
    );
  }
}
