import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { UserGroupService } from '../../../services/user-group/user.group.service';
import { RoleService } from '../../../services/role/role.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { UserGroup } from '../../../services/user-group/domain/user.group.domain';
import { Role } from '../../../services/role/domain/role.domain';

@Component({
  selector: 'app-user-group-form',
  templateUrl: './user.group.form.component.html'
})
export class UserGroupFormComponent extends BaseComponent implements OnInit {
  userGroupForm!: FormGroup;
  roles: Role[] = [];
  userGroupId?: number;
  availableRoles: Role[] = [];
  assignedRoles: Role[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userGroupService: UserGroupService,
    private roleService: RoleService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchRoles();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.userGroupId = Number(paramMap.get('id'));
      this.userGroupId ? this.fetchUserGroup(this.userGroupId) : this.prepareForm();
    });
  }

  prepareForm(formData?: UserGroup): void {
    formData = formData || new UserGroup();

    this.userGroupForm = this.formBuilder.group({
      name: [formData.name, Validators.required],
      description: [formData.description],
      roleIds: [formData.roles ? formData.roles.map(role => role.id) : []]
    });

    this.subscribers.roleIdsChangeSub = this.userGroupForm.get('roleIds')!.valueChanges
      .subscribe(() => this.syncRoleLists());

    this.syncRoleLists();
  }

  syncRoleLists(): void {
    if (!this.userGroupForm) { return; }

    const selectedIds: number[] = this.userGroupForm.get('roleIds')?.value || [];
    this.assignedRoles = this.roles.filter(role => selectedIds.includes(role.id));
    this.availableRoles = this.roles.filter(role => !selectedIds.includes(role.id));
  }

  onRoleAssignmentChanged(): void {
    this.userGroupForm.get('roleIds')!.setValue(this.assignedRoles.map(role => role.id));
  }

  fetchRoles(): void {
    const params = new Map<any, any>();
    params.set('isPageable', false);
    this.subscribers.fetchRolesSub = this.roleService.searchRoles(params).subscribe(response => {
      this.roles = response?.list || [];
      this.syncRoleLists();
    });
  }

  fetchUserGroup(id: number): void {
    this.subscribers.findUserGroupSub = this.userGroupService.findUserGroupById(id).subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.userGroupForm)) { return; }

    const payload: any = { ...this.userGroupForm.getRawValue() };

    this.commonConfirmDialogService.confirm(() => {
      this.userGroupId ? this.updateUserGroup({ ...payload, id: this.userGroupId }) : this.createUserGroup(payload);
    });
  }

  createUserGroup(payload: any): void {
    this.subscribers.createUserGroupSub = this.userGroupService.createUserGroup(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('userGroup.createSuccess');
      this.navigateToSearch();
    });
  }

  updateUserGroup(payload: any): void {
    this.subscribers.updateUserGroupSub = this.userGroupService.updateUserGroup(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('userGroup.updateSuccess');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/user-groups']);
  }
}
