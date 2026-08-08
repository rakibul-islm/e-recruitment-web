import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { PermissionService } from '../../../services/permission/permission.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Permission, PermissionRequest } from '../../../services/permission/domain/permission.domain';

@Component({
  selector: 'app-permission-form',
  templateUrl: './permission.form.component.html'
})
export class PermissionFormComponent extends BaseComponent implements OnInit {
  permissionForm!: FormGroup;
  permissionId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.permissionId = Number(paramMap.get('id'));
      this.permissionId ? this.fetchPermission(this.permissionId) : this.prepareForm();
    });
  }

  prepareForm(formData?: Permission): void {
    formData = formData || new Permission();

    this.permissionForm = this.formBuilder.group({
      name: [formData.name, Validators.required],
      authority: [formData.authority, Validators.required],
      module: [formData.module],
      routeName: [formData.routeName],
      description: [formData.description]
    });
  }

  fetchPermission(id: number): void {
    this.subscribers.findPermissionSub = this.permissionService.findPermissionById(id)
    .subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.permissionForm)) { return; }

    const payload: PermissionRequest = this.permissionForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => {
      this.permissionId ? this.updatePermission({ ...payload, id: this.permissionId }) : this.createPermission(payload);
    });
  }

  createPermission(payload: PermissionRequest): void {
    this.subscribers.createPermissionSub = this.permissionService.createPermission(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg('Permission created successfully!');
      this.navigateToSearch();
    });
  }

  updatePermission(payload: PermissionRequest): void {
    this.subscribers.updatePermissionSub = this.permissionService.updatePermission(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg('Permission updated successfully!');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/permissions']);
  }
}
