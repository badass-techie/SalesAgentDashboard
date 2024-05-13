import { Routes } from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {SchoolsComponent} from "./schools/schools.component";

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'schools/:id', component: SchoolsComponent }
];
