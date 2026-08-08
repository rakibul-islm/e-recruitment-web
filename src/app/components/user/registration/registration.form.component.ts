import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  registerForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private commonConfirmDialogService: CommonConfirmDialogService) {
    super();
  }

  ngOnInit() {
    this.prepareForm();
  }

  prepareForm(formData?: Register) {
    formData = formData || new Register();

    this.registerForm = this.formBuilder.group({
      fullName: [formData.fullName, Validators.required],
      email: [formData.email, [Validators.required, Validators.email]],
      mobile: [formData.mobile, [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      password: [formData.password, [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null
      : { passwordMismatch: true };
  }

  submit() {
    if (this.isFormInvalid(this.registerForm)) { return; }

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
