// frontend/src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  logoutUser(refreshToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.baseUrl}logout/`,{ refresh_token: refreshToken },{ headers: headers });
  }
}
