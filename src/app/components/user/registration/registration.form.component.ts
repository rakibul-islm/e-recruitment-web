import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/utility/notification.service';
import { BaseComponent } from '../../base.component';
import { Register } from '../../../services/user/domain/user.domain';
import { UserService } from '../../../services/user/user.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-signup',
  templateUrl: './registration.form.component.html',
  styleUrls: ['./registration.form.component.scss']
})
export class RegistrationFormComponent extends BaseComponent implements OnInit {
  registerForm!: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private userService: UserService,
    private commonConfirmDialogService: CommonConfirmDialogService,
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
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: UntypedFormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null
      : { passwordMismatch: true };
  }

  submit() {
    this.markFormGroupAsTouched(this.registerForm);
    if (this.registerForm.invalid) { return; }

    const register: Register = this.registerForm.getRawValue();
    this.commonConfirmDialogService.confirm(() => this.createRegistration(register));
  }

  createRegistration(register: Register) {
    this.subscribers.createRegisterUserSub = this.userService.createRegisterUser(register)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg('Registration Successful!');
      this.navigateToLogin();
    });
  }

  navigateToLogin(){
    this.router.navigate(['/login']);
  }
}
