import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1/auth/';
  private locationBaseUrl = 'http://localhost:8000/api/v1/location/';
  private adminBaseUrl = 'http://localhost:8000/api/v1/admin/';
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

  setNewPassword(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}set-new-password/`, data);
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

  refreshToken(): Observable<any> {
    const refreshToken = this.cookieService.get('refresh_token');
    return this.http.post(`${this.baseUrl}token/refresh/`, {
      refresh: refreshToken,
    });
  }

  getNearestPlace(lat: number, lon: number, amenity: string): Observable<any> {
    return this.http.get(
      `${this.locationBaseUrl}nearest_place/?lat=${lat}&lon=${lon}&amenity=${amenity}`
    );
  }

  countAmenities(
    lat: number,
    lon: number,
    amenity: string,
    distance: number
  ): Observable<any> {
    return this.http.get(
      `${this.locationBaseUrl}count_amenities/?lat=${lat}&lon=${lon}&amenity=${amenity}&distance=${distance}`
    );
  }

  getUsers(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
    });
    return this.http.get(`${this.adminBaseUrl}users/`, { headers: headers });
  }

  deleteUser(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
    });
    return this.http.delete(`${this.adminBaseUrl}users/${userId}/delete/`, {
      headers: headers,
    });
  }

  getRoles(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
    });
    return this.http.get(`${this.adminBaseUrl}roles/`, { headers: headers });
  }

  getSystemConfig(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
    });
    return this.http.get(`${this.adminBaseUrl}system-config/`, {
      headers: headers,
    });
  }

  updateSystemConfig(config: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.adminBaseUrl}system-config/`,
      { config },
      { headers: headers }
    );
  }

  getActivityLogs(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
    });
    return this.http.get(`${this.adminBaseUrl}activity-logs/`, {
      headers: headers,
    });
  }
}
