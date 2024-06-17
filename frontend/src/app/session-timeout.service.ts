import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  private timeout: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private ngZone: NgZone
  ) {}

  startSessionTimer(expirationTime: number) {
    this.clearSessionTimer();
    this.ngZone.runOutsideAngular(() => {
      this.timeout = setTimeout(() => {
        this.ngZone.run(() => this.handleSessionTimeout());
      }, expirationTime);
    });
  }

  clearSessionTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private handleSessionTimeout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
