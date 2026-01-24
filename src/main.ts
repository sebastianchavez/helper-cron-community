import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LoggerService } from './app/core/services/logger/logger.service';

const loggerService = new LoggerService();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => loggerService.error('MAIN', 'bootstrapApplication', { info: 'Failed to bootstrap application', error: err }));
