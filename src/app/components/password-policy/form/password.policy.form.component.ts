import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../base.component';
import { PasswordPolicyService } from '../../../services/password-policy/password.policy.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { PasswordPolicy, PasswordPolicyRequest } from '../../../services/password-policy/domain/password.policy.domain';

@Component({
  selector: 'app-password-policy-form',
  templateUrl: './password.policy.form.component.html'
})
export class PasswordPolicyFormComponent extends BaseComponent implements OnInit {
  passwordPolicyForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private passwordPolicyService: PasswordPolicyService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchPasswordPolicy();
  }

  prepareForm(formData: PasswordPolicy): void {
    this.passwordPolicyForm = this.formBuilder.group({
      minLength: [formData.minLength, Validators.required],
      maxLength: [formData.maxLength, Validators.required],
      requireUppercase: [formData.requireUppercase],
      requireLowercase: [formData.requireLowercase],
      requireDigit: [formData.requireDigit],
      requireSpecialChar: [formData.requireSpecialChar],
      disallowUserInfoInPassword: [formData.disallowUserInfoInPassword]
    });
  }

  fetchPasswordPolicy(): void {
    this.subscribers.findPasswordPolicySub = this.passwordPolicyService.getPasswordPolicy()
    .subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.passwordPolicyForm)) { return; }

    const payload: PasswordPolicyRequest = this.passwordPolicyForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => this.updatePasswordPolicy(payload));
  }

  updatePasswordPolicy(payload: PasswordPolicyRequest): void {
    this.subscribers.updatePasswordPolicySub = this.passwordPolicyService.updatePasswordPolicy(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg(this.translate.instant('passwordPolicy.updateSuccess'));
      this.navigateToView();
    });
  }

  navigateToView(): void {
    this.router.navigate(['/password-policy']);
  }
}
