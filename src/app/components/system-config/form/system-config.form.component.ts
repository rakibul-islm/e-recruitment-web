import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { SystemConfigService } from '../../../services/system-config/system-config.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { SystemConfig, SystemConfigRequest } from '../../../services/system-config/domain/system-config.domain';

@Component({
  selector: 'app-system-config-form',
  templateUrl: './system-config.form.component.html'
})
export class SystemConfigFormComponent extends BaseComponent implements OnInit {
  systemConfigForm!: FormGroup;
  systemConfigId!: number;
  expectedValues: string = '';
  configValueOptions: { label: string; value: string }[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private systemConfigService: SystemConfigService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.systemConfigId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchSystemConfig(this.systemConfigId);
  }

  prepareForm(formData: SystemConfig): void {
    this.expectedValues = formData.expectedValues || '';

    this.systemConfigForm = this.formBuilder.group({
      configKey: [{ value: formData.configKey, disabled: true }, Validators.required],
      configValue: [formData.configValue, Validators.required],
      description: [formData.description]
    });

    this.configValueOptions = this.expectedValues
      .split(',')
      .map(value => value.trim())
      .filter(value => value.length > 0)
      .map(value => ({ label: value, value }));
  }

  fetchSystemConfig(id: number): void {
    this.subscribers.findSystemConfigSub = this.systemConfigService.findSystemConfigById(id)
    .subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.systemConfigForm)) { return; }

    const payload: SystemConfigRequest = {
      ...this.systemConfigForm.getRawValue(),
      expectedValues: this.expectedValues,
      id: this.systemConfigId
    };

    this.commonConfirmDialogService.confirm(() => this.updateSystemConfig(payload));
  }

  updateSystemConfig(payload: SystemConfigRequest): void {
    this.subscribers.updateSystemConfigSub = this.systemConfigService.updateSystemConfig(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg('Config updated successfully!');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/system-configs']);
  }
}
