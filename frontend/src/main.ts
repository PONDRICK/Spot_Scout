// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthService } from './app/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthInterceptor } from './app/auth.interceptor';

const mergedConfig: ApplicationConfig = {
  providers: [
    ...appConfig.providers,
    importProvidersFrom(HttpClientModule, RouterModule.forRoot(routes)),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthService,
    CookieService,
  ],
};

bootstrapApplication(AppComponent, mergedConfig);
