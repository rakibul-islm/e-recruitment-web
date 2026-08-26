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
import { ExceptionLogSearchComponent } from './components/exception-log/search/exception-log.search.component';
import { ExceptionLogViewComponent } from './components/exception-log/view/exception-log.view.component';
import { SessionSearchComponent } from './components/session/search/session.search.component';
import { SessionViewComponent } from './components/session/view/session.view.component';
import { AuditLogSearchComponent } from './components/audit-log/search/audit-log.search.component';
import { AuditLogViewComponent } from './components/audit-log/view/audit-log.view.component';
import { ArchiveConfigSearchComponent } from './components/archive-config/search/archive-config.search.component';
import { ArchiveConfigFormComponent } from './components/archive-config/form/archive-config.form.component';
import { ArchiveConfigViewComponent } from './components/archive-config/view/archive-config.view.component';
import { ArchiveConfigArchivedDataComponent } from './components/archive-config/archived-data/archive-config.archived-data.component';
import { AccessDeniedComponent } from './components/shared/access-denied/access-denied.component';
import { PermissionGuard } from './services/utility/security/permission.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegistrationFormComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'set-password', component: SetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
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
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'role-list' }
  },
  { path: 'roles/create',
    component: RoleFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'role-manage' }
  },
  { path: 'roles/:id/edit',
    component: RoleFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'role-manage' }
  },
  { path: 'roles/:id',
    component: RoleViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'role-list' }
  },
  { path: 'users',
    component: UserSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-list' }
  },
  { path: 'users/create',
    component: UserFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-manage' }
  },
  { path: 'users/:id/edit',
    component: UserFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-manage' }
  },
  { path: 'users/:id',
    component: UserViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-list' }
  },
  { path: 'user-groups',
    component: UserGroupSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-group-list' }
  },
  { path: 'user-groups/create',
    component: UserGroupFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-group-manage' }
  },
  { path: 'user-groups/:id/edit',
    component: UserGroupFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-group-manage' }
  },
  { path: 'user-groups/:id',
    component: UserGroupViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'user-group-list' }
  },
  { path: 'permissions',
    component: PermissionSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'permission-list' }
  },
  { path: 'permissions/create',
    component: PermissionFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'permission-manage' }
  },
  { path: 'permissions/:id/edit',
    component: PermissionFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'permission-manage' }
  },
  { path: 'permissions/:id',
    component: PermissionViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'permission-list' }
  },
  { path: 'system-configs',
    component: SystemConfigSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'system-config-list' }
  },
  { path: 'system-configs/:id/edit',
    component: SystemConfigFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'system-config-manage' }
  },
  { path: 'system-configs/:id',
    component: SystemConfigViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'system-config-list' }
  },
  { path: 'password-policy',
    component: PasswordPolicyViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'password-policy-list' }
  },
  { path: 'password-policy/edit',
    component: PasswordPolicyFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'password-policy-manage' }
  },
  { path: 'exception-logs',
    component: ExceptionLogSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'exception-log-list' }
  },
  { path: 'exception-logs/:id',
    component: ExceptionLogViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'exception-log-list' }
  },
  { path: 'sessions',
    component: SessionSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'session-list' }
  },
  { path: 'sessions/:id',
    component: SessionViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'session-list' }
  },
  { path: 'audit-logs',
    component: AuditLogSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'audit-log-list' }
  },
  { path: 'audit-logs/:id',
    component: AuditLogViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'audit-log-list' }
  },
  { path: 'archive-configs',
    component: ArchiveConfigSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'archive-config-list' }
  },
  { path: 'archive-configs/create',
    component: ArchiveConfigFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'archive-config-manage' }
  },
  { path: 'archive-configs/:id/edit',
    component: ArchiveConfigFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'archive-config-manage' }
  },
  { path: 'archive-configs/:id/archived-data',
    component: ArchiveConfigArchivedDataComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'archive-config-list' }
  },
  { path: 'archive-configs/:id',
    component: ArchiveConfigViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'archive-config-list' }
  },

  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
