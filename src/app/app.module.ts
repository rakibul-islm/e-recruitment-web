import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/user/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppHeaderComponent } from './components/shared/app-header/app.header.component';
import { ProfileViewComponent } from './components/user/profile/view/profile.view.component';
import { ProfileEditComponent } from './components/user/profile/edit/profile.edit.component';
import { ChangePasswordComponent } from './components/user/password/change-password/change.password.component';
import { PageHeaderComponent } from './components/shared/page-header/page.header.component';
import { RegistrationFormComponent } from './components/user/registration/registration.form.component';
import { ForgotPasswordComponent } from './components/user/password/forgot-password/forgot.password.component';
import { SetPasswordComponent } from './components/user/password/set-password/set.password.component';
import { AuthService } from './services/utility/security/auth.service';
import { AuthInterceptor } from './services/utility/interceptors/auth.interceptor';
import { LoadingInterceptor } from './services/utility/interceptors/loading.interceptor';
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
import { ArchiveConfigWhereConditionBuilderComponent } from './components/archive-config/where-condition-builder/archive.config.where.condition.builder.component';
import { AccessDeniedComponent } from './components/shared/access-denied/access.denied.component';
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
import { RequiredFieldDirective } from './directives/required.field.directive';
import { OtpNumericKeyboardDirective } from './directives/otp.numeric.keyboard.directive';
import { PermissionHideDirective } from './directives/permission.hide.directive';
import { PermissionDisableDirective } from './directives/permission.disable.directive';
import { TranslateOptionsDirective } from './directives/translate.options.directive';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { InputOtpModule } from 'primeng/inputotp';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AppHeaderComponent,
    ProfileViewComponent,
    ProfileEditComponent,
    ChangePasswordComponent,
    RegistrationFormComponent,
    ForgotPasswordComponent,
    SetPasswordComponent,
    PageHeaderComponent,
    RoleSearchComponent,
    RoleFormComponent,
    RoleViewComponent,
    UserSearchComponent,
    UserFormComponent,
    UserViewComponent,
    UserGroupSearchComponent,
    UserGroupFormComponent,
    UserGroupViewComponent,
    PermissionSearchComponent,
    PermissionFormComponent,
    PermissionViewComponent,
    SystemConfigSearchComponent,
    SystemConfigFormComponent,
    SystemConfigViewComponent,
    PasswordPolicyFormComponent,
    PasswordPolicyViewComponent,
    ExceptionLogSearchComponent,
    ExceptionLogViewComponent,
    SessionSearchComponent,
    SessionViewComponent,
    AuditLogSearchComponent,
    AuditLogViewComponent,
    ArchiveConfigSearchComponent,
    ArchiveConfigFormComponent,
    ArchiveConfigViewComponent,
    ArchiveConfigArchivedDataComponent,
    ArchiveConfigWhereConditionBuilderComponent,
    AccessDeniedComponent,
    JobPortalSearchComponent,
    JobPortalViewComponent,
    CandidateProfileFormComponent,
    CandidateProfileViewComponent,
    CandidateApplicationsComponent,
    CompanySearchComponent,
    CompanyFormComponent,
    CompanyViewComponent,
    JobPostingSearchComponent,
    JobPostingFormComponent,
    JobPostingViewComponent,
    ApplicationManagementSearchComponent,
    ApplicationManagementViewComponent,
    CandidateSavedJobsComponent,
    CandidateJobAlertsComponent,
    CandidateApplicationDetailComponent,
    AnalyticsDashboardComponent,
    HomeComponent,
    RecruiterApplicationRegisterComponent,
    RecruiterApplicationSearchComponent,
    RecruiterApplicationViewComponent,
    RequiredFieldDirective,
    OtpNumericKeyboardDirective,
    PermissionHideDirective,
    PermissionDisableDirective,
    TranslateOptionsDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    PasswordModule,
    InputOtpModule,
    CheckboxModule,
    CardModule,
    MenubarModule,
    MenuModule,
    AvatarModule,
    ConfirmDialogModule,
    FloatLabelModule,
    TableModule,
    PaginatorModule,
    MultiSelectModule,
    PickListModule,
    DropdownModule,
    CalendarModule,
    TooltipModule,
    AccordionModule,
    DialogModule,
    EditorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ConfirmationService,
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
