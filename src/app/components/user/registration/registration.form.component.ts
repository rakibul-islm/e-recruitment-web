import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/utility/notification.service';
import { BaseComponent } from '../../base.component';
import { Register } from '../../../services/user/domain/user.domain';
import { UserService } from '../../../services/user/user.service';
import { ConfirmationService } from '../../../services/utility/confirmation.service';

@Component({
  selector: 'app-signup',
  templateUrl: './registration.form.component.html'
})
export class RegistrationFormComponent extends BaseComponent implements OnInit {
  registerForm!: FormGroup;
  passwordFieldType: string = 'password';

  constructor(
    private formBuilder: FormBuilder, 
    private router: Router,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService) {
    super();
  }

  ngOnInit() {
    this.prepareRegisterForm();
  }

  prepareRegisterForm(formData?: Register) {
    formData = formData || new Register();

    this.registerForm = this.formBuilder.group({
      fullName: [formData.fullName, Validators.required],
      username: [formData.username, Validators.required],
      email: [formData.email, [Validators.required, Validators.email]],
      address: [formData.address, Validators.required],
      mobile: [formData.mobile, [Validators.required, Validators.pattern('^[0-9]{10,15}$'), Validators.minLength(11), Validators.maxLength(11)]],
      password: [formData.password, [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null
      : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  submit() {
    this.markFormGroupAsTouched(this.registerForm);
    if (this.registerForm.invalid) { return; }

    const register: Register = this.registerForm.getRawValue();

    this.confirmationService.confirm(
      'Are you sure that you want to perform this action?',
      () => {
        this.createRegistration(register);
      },
      () => {
        console.log('Action rejected!');
      })
  }

  createRegistration(register: Register) {
    this.subscribers.createRegisterUserSub = this.userService.createRegisterUser(register)
    .subscribe(data => {
      this.notificationService.sendSuccessMsg('Registration Successful!');
      this.navigateToLogin();
    });
  }

  navigateToLogin(){
    this.router.navigate(['/login']);
  }
}
