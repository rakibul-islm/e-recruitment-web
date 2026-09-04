import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/user/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileViewComponent } from './components/user/profile/view/profile.view.component';
import { ProfileEditComponent } from './components/user/profile/edit/profile.edit.component';
import { ChangePasswordComponent } from './components/user/password/change-password/change.password.component';
import { RegistrationFormComponent } from './components/user/registration/registration.form.component';
import { ForgotPasswordComponent } from './components/user/password/forgot-password/forgot.password.component';
import { SetPasswordComponent } from './components/user/password/set-password/set.password.component';
import { AuthGuard } from './services/utility/security/auth.guard';
import { RoleSearchComponent } from './components/role/search/role.search.component';
import { RoleFormComponent } from './components/role/form/role.form.component';
import { RoleViewComponent } from './components/role/view/role.view.component';
import { UserSearchComponent } from './components/user/management/search/user.search.component';
import { UserFormComponent } from './components/user/management/form/user.form.component';
import { UserViewComponent } from './components/user/management/view/user.view.component';
import { UserGroupSearchComponent } from './components/user-group/search/user.group.search.component';
import { UserGroupFormComponent } from './components/user-group/form/user.group.form.component';
import { UserGroupViewComponent } from './components/user-group/view/user.group.view.component';
import { PermissionSearchComponent } from './components/permission/search/permission.search.component';
import { PermissionFormComponent } from './components/permission/form/permission.form.component';
import { PermissionViewComponent } from './components/permission/view/permission.view.component';
import { SystemConfigSearchComponent } from './components/system-config/search/system.config.search.component';
import { SystemConfigFormComponent } from './components/system-config/form/system.config.form.component';
import { SystemConfigViewComponent } from './components/system-config/view/system.config.view.component';
import { PasswordPolicyFormComponent } from './components/password-policy/form/password.policy.form.component';
import { PasswordPolicyViewComponent } from './components/password-policy/view/password.policy.view.component';
import { ExceptionLogSearchComponent } from './components/exception-log/search/exception.log.search.component';
import { ExceptionLogViewComponent } from './components/exception-log/view/exception.log.view.component';
import { SessionSearchComponent } from './components/session/search/session.search.component';
import { SessionViewComponent } from './components/session/view/session.view.component';
import { AuditLogSearchComponent } from './components/audit-log/search/audit.log.search.component';
import { AuditLogViewComponent } from './components/audit-log/view/audit.log.view.component';
import { ArchiveConfigSearchComponent } from './components/archive-config/search/archive.config.search.component';
import { ArchiveConfigFormComponent } from './components/archive-config/form/archive.config.form.component';
import { ArchiveConfigViewComponent } from './components/archive-config/view/archive.config.view.component';
import { ArchiveConfigArchivedDataComponent } from './components/archive-config/archived-data/archive.config.archived.data.component';
import { AccessDeniedComponent } from './components/shared/access-denied/access.denied.component';
import { PermissionGuard } from './services/utility/security/permission.guard';
import { JobPortalSearchComponent } from './components/job-portal/search/job.portal.search.component';
import { JobPortalViewComponent } from './components/job-portal/view/job.portal.view.component';
import { CandidateProfileFormComponent } from './components/candidate/profile/candidate.profile.form.component';
import { CandidateProfileViewComponent } from './components/candidate/profile/view/candidate.profile.view.component';
import { CandidateApplicationsComponent } from './components/candidate/applications/candidate.applications.component';
import { CompanySearchComponent } from './components/company/search/company.search.component';
import { CompanyFormComponent } from './components/company/form/company.form.component';
import { CompanyViewComponent } from './components/company/view/company.view.component';
import { JobPostingSearchComponent } from './components/job-posting/search/job.posting.search.component';
import { JobPostingFormComponent } from './components/job-posting/form/job.posting.form.component';
import { JobPostingViewComponent } from './components/job-posting/view/job.posting.view.component';
import { ApplicationManagementSearchComponent } from './components/application-management/search/application.management.search.component';
import { ApplicationManagementViewComponent } from './components/application-management/view/application.management.view.component';
import { CandidateSavedJobsComponent } from './components/candidate/saved-jobs/candidate.saved.jobs.component';
import { CandidateJobAlertsComponent } from './components/candidate/job-alerts/candidate.job.alerts.component';
import { CandidateApplicationDetailComponent } from './components/candidate/application-detail/candidate.application.detail.component';
import { AnalyticsDashboardComponent } from './components/analytics/analytics.dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { RecruiterApplicationRegisterComponent } from './components/recruiter-application/register/recruiter.application.register.component';
import { RecruiterApplicationSearchComponent } from './components/recruiter-application/search/recruiter.application.search.component';
import { RecruiterApplicationViewComponent } from './components/recruiter-application/view/recruiter.application.view.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegistrationFormComponent },
  { path: 'register/recruiter', component: RecruiterApplicationRegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'set-password', component: SetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'access-denied', component: AccessDeniedComponent },

  { path: 'jobs', component: JobPortalSearchComponent },
  { path: 'jobs/:id', component: JobPortalViewComponent },

  { path: 'my/profile', component: CandidateProfileViewComponent, canActivate: [AuthGuard] },
  { path: 'my/profile/edit', component: CandidateProfileFormComponent, canActivate: [AuthGuard] },
  { path: 'my/applications', component: CandidateApplicationsComponent, canActivate: [AuthGuard] },
  { path: 'my/applications/:id', component: CandidateApplicationDetailComponent, canActivate: [AuthGuard] },
  { path: 'my/saved-jobs', component: CandidateSavedJobsComponent, canActivate: [AuthGuard] },
  { path: 'my/job-alerts', component: CandidateJobAlertsComponent, canActivate: [AuthGuard] },

  { path: 'analytics',
    component: AnalyticsDashboardComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'analytics-list' }
  },

  { path: 'recruiter-applications',
    component: RecruiterApplicationSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'recruiter-application-list' }
  },
  { path: 'recruiter-applications/:id',
    component: RecruiterApplicationViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'recruiter-application-list' }
  },

  { path: 'companies',
    component: CompanySearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'company-list' }
  },
  { path: 'companies/create',
    component: CompanyFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'company-manage' }
  },
  { path: 'companies/:id/edit',
    component: CompanyFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'company-manage' }
  },
  { path: 'companies/:id',
    component: CompanyViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'company-list' }
  },

  { path: 'job-postings',
    component: JobPostingSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'job-circular-list' }
  },
  { path: 'job-postings/create',
    component: JobPostingFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'job-circular-manage' }
  },
  { path: 'job-postings/:id/edit',
    component: JobPostingFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'job-circular-manage' }
  },
  { path: 'job-postings/:id',
    component: JobPostingViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'job-circular-list' }
  },

  // Gated on job-circular-manage (staff-only) rather than application-list, since candidates also
  // hold application:read for their own /my/applications - see PermissionData's note on application:write.
  { path: 'application-management',
    component: ApplicationManagementSearchComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'job-circular-manage' }
  },
  { path: 'application-management/:id',
    component: ApplicationManagementViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { routeName: 'job-circular-manage' }
  },
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
