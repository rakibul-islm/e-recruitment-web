import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/user/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileViewComponent } from './components/user/profile/view/profile.view.component';
import { ProfileEditComponent } from './components/user/profile/edit/profile.edit.component';
import { ChangePasswordComponent } from './components/user/password/change-password/change-password.component';
import { RegistrationFormComponent } from './components/user/registration/registration.form.component';
import { ForgotPasswordComponent } from './components/user/password/forgot-password/forgot-password.component';
import { SetPasswordComponent } from './components/user/password/set-password/set-password.component';
import { AuthGuard } from './services/utility/security/auth.guard';
import { RoleSearchComponent } from './components/role/search/role.search.component';
import { RoleFormComponent } from './components/role/form/role.form.component';
import { RoleViewComponent } from './components/role/view/role.view.component';
import { UserSearchComponent } from './components/user/management/search/user.search.component';
import { UserFormComponent } from './components/user/management/form/user.form.component';
import { UserViewComponent } from './components/user/management/view/user.view.component';
import { UserGroupSearchComponent } from './components/user-group/search/user-group.search.component';
import { UserGroupFormComponent } from './components/user-group/form/user-group.form.component';
import { UserGroupViewComponent } from './components/user-group/view/user-group.view.component';
import { PermissionSearchComponent } from './components/permission/search/permission.search.component';
import { PermissionFormComponent } from './components/permission/form/permission.form.component';
import { PermissionViewComponent } from './components/permission/view/permission.view.component';
import { SystemConfigSearchComponent } from './components/system-config/search/system-config.search.component';
import { SystemConfigFormComponent } from './components/system-config/form/system-config.form.component';
import { SystemConfigViewComponent } from './components/system-config/view/system-config.view.component';
import { PasswordPolicyFormComponent } from './components/password-policy/form/password-policy.form.component';
import { PasswordPolicyViewComponent } from './components/password-policy/view/password-policy.view.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegistrationFormComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'set-password', component: SetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile',
    component: ProfileViewComponent,
    canActivate: [AuthGuard]
  },
  { path: 'profile/edit',
    component: ProfileEditComponent,
    canActivate: [AuthGuard]
  },
  { path: 'profile/change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard]
  },
  { path: 'roles',
    component: RoleSearchComponent,
    canActivate: [AuthGuard]
  },
  { path: 'roles/create',
    component: RoleFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'roles/:id/edit',
    component: RoleFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'roles/:id',
    component: RoleViewComponent,
    canActivate: [AuthGuard]
  },
  { path: 'users',
    component: UserSearchComponent,
    canActivate: [AuthGuard]
  },
  { path: 'users/create',
    component: UserFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'users/:id/edit',
    component: UserFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'users/:id',
    component: UserViewComponent,
    canActivate: [AuthGuard]
  },
  { path: 'user-groups',
    component: UserGroupSearchComponent,
    canActivate: [AuthGuard]
  },
  { path: 'user-groups/create',
    component: UserGroupFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'user-groups/:id/edit',
    component: UserGroupFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'user-groups/:id',
    component: UserGroupViewComponent,
    canActivate: [AuthGuard]
  },
  { path: 'permissions',
    component: PermissionSearchComponent,
    canActivate: [AuthGuard]
  },
  { path: 'permissions/create',
    component: PermissionFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'permissions/:id/edit',
    component: PermissionFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'permissions/:id',
    component: PermissionViewComponent,
    canActivate: [AuthGuard]
  },
  { path: 'system-configs',
    component: SystemConfigSearchComponent,
    canActivate: [AuthGuard]
  },
  { path: 'system-configs/:id/edit',
    component: SystemConfigFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'system-configs/:id',
    component: SystemConfigViewComponent,
    canActivate: [AuthGuard]
  },
  { path: 'password-policy',
    component: PasswordPolicyViewComponent,
    canActivate: [AuthGuard]
  },
  { path: 'password-policy/edit',
    component: PasswordPolicyFormComponent,
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
