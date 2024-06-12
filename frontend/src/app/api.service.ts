// frontend/src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1/auth/';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

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
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.baseUrl}logout/`,
      { refresh_token: refreshToken },
      { headers: headers }
    );
  }

  setToken(access_token: string, refresh_token: string) {
    this.cookieService.set('access_token', access_token);
    this.cookieService.set('refresh_token', refresh_token);
  }

  clearToken() {
    this.cookieService.delete('access_token');
    this.cookieService.delete('refresh_token');
  }

  getCookie(name: string): string {
    return this.cookieService.get(name);
  }
}