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
  private mapBaseUrl = 'http://localhost:8000/api/v1/maps/';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  // User related APIs
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}register/`, userData);
  }

  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials);
  }

  resetPassword(email: any): Observable<any> {
    return this.http.post(`${this.baseUrl}password-reset/`, email);
  }

  verifyOTP(otpData: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}verify-email/${token}/`, otpData);
  }

  resendOTP(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}resend-otp/`, JSON.stringify(data), { headers });
  }

  getOTPExpiration(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}get-otp-expiration/`, JSON.stringify({ token }), { headers });
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

  // Location related APIs
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

  banUser(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.adminBaseUrl}ban-user/`,
      { user_id: userId },
      { headers: headers }
    );
  }

  unbanUser(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.adminBaseUrl}unban-user/`,
      { user_id: userId },
      { headers: headers }
    );
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

  getPopulation(lat: number, lon: number, distance: number): Observable<any> {
    return this.http.get(
      `${this.locationBaseUrl}population/?lat=${lat}&lon=${lon}&distance=${distance}`
    );
  }

  predictModel(lat: number, lon: number): Observable<any> {
    return this.http.post(`${this.locationBaseUrl}add-location/`, {
      lat: lat,
      lon: lon,
    });
  }

  // Map related APIs
  saveUserMap(mapData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.mapBaseUrl}save_map/`, mapData, {
      headers: headers,
    });
  }

  getUserMaps(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
    });
    return this.http.get(`${this.mapBaseUrl}user_maps/`, { headers: headers });
  }

  deleteUserMap(mapId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.delete(`${this.mapBaseUrl}delete_map/${mapId}/`, {
      headers: headers,
    });
  }

  getEconomyDetails(lat: number, lon: number): Observable<any> {
    return this.http.get(
      `${this.locationBaseUrl}location-details/?lat=${lat}&lon=${lon}`
    );
  }
  
  
}
