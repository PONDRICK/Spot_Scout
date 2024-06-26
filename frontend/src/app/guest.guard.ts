import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    const accessToken = this.cookieService.get('access_token');
    const isSuperuser = this.cookieService.get('is_superuser') === 'true'; // Assuming is_superuser is stored in cookies

    if (accessToken) {
      if (isSuperuser) {
        this.router.navigate(['/admin']); // Redirect to admin if superuser
      } else {
        this.router.navigate(['/dashboard']); // Redirect to dashboard if not superuser
      }
      return false;
    }
    return true;
  }
}