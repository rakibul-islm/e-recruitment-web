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
import { ChangePasswordComponent } from './components/user/password/change-password/change-password.component';
import { PageHeaderComponent } from './components/shared/page-header/page-header.component';
import { RegistrationFormComponent } from './components/user/registration/registration.form.component';
import { ForgotPasswordComponent } from './components/user/password/forgot-password/forgot-password.component';
import { SetPasswordComponent } from './components/user/password/set-password/set-password.component';
import { AuthService } from './services/utility/security/auth.service';
import { AuthInterceptor } from './services/utility/interceptors/auth.interceptor';
import { LoadingInterceptor } from './services/utility/interceptors/loading.interceptor';
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
import { RequiredFieldDirective } from './directives/required-field.directive';

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
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';

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
    RequiredFieldDirective
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
    MultiSelectModule,
    PickListModule,
    DropdownModule,
    CalendarModule,
    TooltipModule,
    AccordionModule,
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
