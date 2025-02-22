import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/user/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './services/security/auth.guard';
import { ProfileViewComponent } from './components/user/profile/view/profile.view.component';
import { RegistrationFormComponent } from './components/user/registration/registration.form.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegistrationFormComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', 
    component: ProfileViewComponent, 
    canActivate: [AuthGuard] 
  },

  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
