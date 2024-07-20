import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = this.cookieService.get('access_token');
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('token/refresh/')) {
          // Token expired, attempt to refresh
          return this.authService.refreshToken().pipe(
            switchMap((newTokens: any) => {
              if (newTokens) {
                this.cookieService.set('access_token', newTokens.access, {
                  path: '/',
                });

                // Console log the new access token
                console.log('New access token:', newTokens.access);

                req = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newTokens.access}`,
                  },
                });
                return next.handle(req);
              }
              return throwError(error);
            }),
            catchError((err) => {
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(err);
            })
          );
        } else {
          return throwError(error);
        }
      })
    );
  }
}
