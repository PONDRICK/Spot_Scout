import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1/auth/';

  constructor(private http: HttpClient) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}register/`, userData);
  }

  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials);
  }

  resetPassword(email: any): Observable<any> {
    return this.http.post(`${this.baseUrl}password-reset/`, email);
  }

  verifyOTP(otpData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}verify-email/`, otpData);
  }

  resendOTP(email: any): Observable<any> {
    return this.http.post(`${this.baseUrl}resend-otp/`, email);
  }
}
