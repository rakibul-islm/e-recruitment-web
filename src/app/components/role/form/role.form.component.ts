import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../base.component';
import { RoleService } from '../../../services/role/role.service';
import { PermissionService } from '../../../services/permission/permission.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Role, RoleRequest } from '../../../services/role/domain/role.domain';
import { Permission } from '../../../services/permission/domain/permission.domain';

@Component({
  selector: 'app-role-form',
  templateUrl: './role.form.component.html'
})
export class RoleFormComponent extends BaseComponent implements OnInit {
  roleForm!: FormGroup;
  permissions: Permission[] = [];
  roleId?: number;
  availablePermissions: Permission[] = [];
  assignedPermissions: Permission[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchPermissions();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.roleId = Number(paramMap.get('id'));
      this.roleId ? this.fetchRole(this.roleId) : this.prepareForm();
    });
  }

  prepareForm(formData?: Role): void {
    formData = formData || new Role();
    
    this.roleForm = this.formBuilder.group({
      name: [formData.name, Validators.required],
      code: [formData.code, Validators.required],
      description: [formData.description],
      permissionIds: [formData.permissions ? formData.permissions.map(permission => permission.id) : []]
    });

    this.subscribers.permissionIdsChangeSub = this.roleForm.get('permissionIds')!.valueChanges
      .subscribe(() => this.syncPermissionLists());

    this.syncPermissionLists();
  }

  syncPermissionLists(): void {
    if (!this.roleForm) { return; }

    const selectedIds: number[] = this.roleForm.get('permissionIds')?.value || [];
    this.assignedPermissions = this.permissions.filter(permission => selectedIds.includes(permission.id));
    this.availablePermissions = this.permissions.filter(permission => !selectedIds.includes(permission.id));
  }

  onPermissionAssignmentChanged(): void {
    this.roleForm.get('permissionIds')!.setValue(this.assignedPermissions.map(permission => permission.id));
  }

  fetchPermissions(): void {
    this.subscribers.fetchPermissionsSub = this.permissionService.searchPermissions(new Map().set('isPageable', false))
    .subscribe(response => {
      this.permissions = response?.list || [];
      this.syncPermissionLists();
    });
  }

  fetchRole(id: number): void {
    this.subscribers.findRoleSub = this.roleService.findRoleById(id)
    .subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.roleForm)) { return; }

    const payload: RoleRequest = this.roleForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => {
      this.roleId ? this.updateRole({ ...payload, id: this.roleId }) : this.createRole(payload);
    });
  }

  createRole(payload: RoleRequest): void {
    this.subscribers.createRoleSub = this.roleService.createRole(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg(this.translate.instant('role.createSuccess'));
      this.navigateToSearch();
    });
  }

  updateRole(payload: RoleRequest): void {
    this.subscribers.updateRoleSub = this.roleService.updateRole(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg(this.translate.instant('role.updateSuccess'));
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/roles']);
  }
}
