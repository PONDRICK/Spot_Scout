import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    if (this.cookieService.get('access_token')) {
      this.router.navigate(['/dashboard']); // Redirect to dashboard if logged in
      return false;
    }
    return true;
  }
}
