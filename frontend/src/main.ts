import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// สร้างการตั้งค่าของแอปพลิเคชันและผสมผสานกับ HttpClientModule
const mergedConfig: ApplicationConfig = {
  providers: [...appConfig.providers, importProvidersFrom(HttpClientModule)],
};

bootstrapApplication(AppComponent, mergedConfig);
