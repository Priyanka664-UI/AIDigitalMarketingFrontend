import { Routes } from '@angular/router';
import { BrandSetupComponent } from './components/brand-setup/brand-setup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/setup', pathMatch: 'full' },
  { path: 'setup', component: BrandSetupComponent },
  { path: 'dashboard', component: DashboardComponent }
];
