import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

interface AuthResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api/v1/auth/';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}login/`, credentials)
      .pipe(
        tap((response) => this.setSession(response)),
        catchError(this.handleError)
      );
  }

  private setSession(authResult: AuthResponse): void {
    this.cookieService.set('access_token', authResult.access, { path: '/' });
    this.cookieService.set('refresh_token', authResult.refresh, { path: '/' });
  }


  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.cookieService.get('refresh_token');
    return this.http
      .post<AuthResponse>(`${this.baseUrl}token/refresh/`, { refresh: refreshToken })
      .pipe(
        tap((response) => {
          this.cookieService.set('access_token', response.access, { path: '/' });
          console.log('New access token:', response.access); // Log new access token
        }),
        catchError((error) => {
          this.logout();
          return throwError(error);
        })
      );
  }


  logout(): void {
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');
    console.log('logout success (cookie)');
    this.router.navigate(['/login']);
  }

  private handleError(error: any): Observable<never> {
    console.error(error);
    return throwError(error);
  }

  isTokenExpired(token: string): boolean {
    if (!token) {
      return true;
    }

    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  isAccessTokenExpired(): boolean {
    const token = this.cookieService.get('access_token');
    return this.isTokenExpired(token);
  }

  isRefreshTokenExpired(): boolean {
    const token = this.cookieService.get('refresh_token');
    return this.isTokenExpired(token);
  }
}
