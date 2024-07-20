import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class SuperUserGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    const isSuperUser = this.cookieService.get('is_superuser') === 'true';
    if (!isSuperUser) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
