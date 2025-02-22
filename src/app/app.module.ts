import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/user/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppHeaderComponent } from './components/app-header/app.header.component';
import { ProfileViewComponent } from './components/user/profile/view/profile.view.component';
import { ToastrModule } from 'ngx-toastr';
import { RegistrationFormComponent } from './components/user/registration/registration.form.component';
import { ConfirmationDialogComponent } from './components/utility/confirmation-dialog/confirmation.dialog.component';
import { ConfirmationService } from './services/utility/confirmation.service';
import { AuthService } from './services/utility/security/auth.service';
import { AuthInterceptor } from './services/utility/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AppHeaderComponent,
    ProfileViewComponent,
    RegistrationFormComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule, 
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
      preventDuplicates: true
    }),
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ConfirmationService,
  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
