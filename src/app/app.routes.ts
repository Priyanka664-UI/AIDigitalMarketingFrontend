import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BrandSetupComponent } from './components/brand-setup/brand-setup.component';
import { MarketingStrategyComponent } from './components/marketing-strategy/marketing-strategy.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'brand-setup', component: BrandSetupComponent },
  { path: 'marketing-strategy', component: MarketingStrategyComponent }
];
