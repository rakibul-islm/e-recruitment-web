import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base.component';
import { PasswordPolicyService } from '../../../services/password-policy/password-policy.service';
import { PasswordPolicy } from '../../../services/password-policy/domain/password-policy.domain';

@Component({
  selector: 'app-password-policy-view',
  templateUrl: './password-policy.view.component.html'
})
export class PasswordPolicyViewComponent extends BaseComponent implements OnInit {
  passwordPolicy: PasswordPolicy = new PasswordPolicy();

  constructor(
    private passwordPolicyService: PasswordPolicyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchPasswordPolicy();
  }

  fetchPasswordPolicy(): void {
    this.subscribers.findPasswordPolicySub = this.passwordPolicyService.getPasswordPolicy().subscribe(response => {
      this.passwordPolicy = response?.obj;
    });
  }
}
