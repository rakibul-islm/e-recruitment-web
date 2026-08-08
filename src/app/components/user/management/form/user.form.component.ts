import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { UserService } from '../../../../services/user/user.service';
import { RoleService } from '../../../../services/role/role.service';
import { UserGroupService } from '../../../../services/user-group/user-group.service';
import { CommonConfirmDialogService } from '../../../../services/utility/common.confirm.dialog.service';
import { UserAccount } from '../../../../services/user/domain/user.domain';
import { Role } from '../../../../services/role/domain/role.domain';
import { UserGroup } from '../../../../services/user-group/domain/user-group.domain';

@Component({
  selector: 'app-user-form',
  templateUrl: './user.form.component.html'
})
export class UserFormComponent extends BaseComponent implements OnInit {
  userForm!: FormGroup;
  roles: Role[] = [];
  userGroups: UserGroup[] = [];
  userId?: number;
  availableRoles: Role[] = [];
  assignedRoles: Role[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private userGroupService: UserGroupService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchRoles();
    this.fetchUserGroups();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.userId = Number(paramMap.get('id'));
      this.userId ? this.fetchUser(this.userId) : this.prepareForm();
    });
  }

  prepareForm(formData?: UserAccount): void {
    formData = formData || new UserAccount();

    this.userForm = this.formBuilder.group({
      fullName: [formData.fullName, Validators.required],
      email: [formData.email, [Validators.required, Validators.email]],
      password: ['', this.userId ? [] : [Validators.required]],
      address: [formData.address],
      phone: [formData.phone],
      mobile: [formData.mobile, [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      active: [formData.active ?? true],
      locked: [formData.locked ?? false],
      expiryDate: [formData.expiryDate ? new Date(formData.expiryDate) : null, Validators.required],
      roleIds: [formData.roles ? formData.roles.map(role => role.id) : []],
      userGroupId: [formData.userGroup ? formData.userGroup.id : null]
    });

    this.subscribers.userGroupChangeSub = this.userForm.get('userGroupId')!.valueChanges
    .subscribe(groupId =>
      this.selectGroupRoles(groupId)
    );

    this.subscribers.roleIdsChangeSub = this.userForm.get('roleIds')!.valueChanges
      .subscribe(() => this.syncRoleLists());

    this.syncRoleLists();
  }

  selectGroupRoles(groupId: number | null): void {
    const group = this.userGroups.find(userGroup => userGroup.id === groupId);
    if (!group) { return; }

    const roleIdsControl = this.userForm.get('roleIds')!;
    const selectedRoleIds: number[] = roleIdsControl.value || [];
    const groupRoleIds = group.roles ? group.roles.map(role => role.id) : [];
    roleIdsControl.setValue(Array.from(new Set([...selectedRoleIds, ...groupRoleIds])));
  }

  syncRoleLists(): void {
    if (!this.userForm) { return; }

    const selectedIds: number[] = this.userForm.get('roleIds')?.value || [];
    this.assignedRoles = this.roles.filter(role => selectedIds.includes(role.id));
    this.availableRoles = this.roles.filter(role => !selectedIds.includes(role.id));
  }

  onRoleAssignmentChanged(): void {
    this.userForm.get('roleIds')!.setValue(this.assignedRoles.map(role => role.id));
  }

  fetchRoles(): void {
    const params = new Map<any, any>();
    params.set('isPageable', false);
    this.subscribers.fetchRolesSub = this.roleService.searchRoles(params).subscribe(response => {
      this.roles = response?.list || [];
      this.syncRoleLists();
    });
  }

  fetchUserGroups(): void {
    const params = new Map<any, any>();
    params.set('isPageable', false);
    this.subscribers.fetchUserGroupsSub = this.userGroupService.searchUserGroups(params).subscribe(response => {
      this.userGroups = response?.list || [];
    });
  }

  fetchUser(id: number): void {
    this.subscribers.findUserSub = this.userService.findUserById(id).subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.userForm)) { return; }

    const payload: any = { ...this.userForm.getRawValue() };
    if (!payload.password) { delete payload.password; }

    this.commonConfirmDialogService.confirm(() => {
      this.userId ? this.updateUser({ ...payload, id: this.userId }) : this.createUser(payload);
    });
  }

  createUser(payload: any): void {
    this.subscribers.createUserSub = this.userService.createUser(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('User created successfully!');
      this.navigateToSearch();
    });
  }

  updateUser(payload: any): void {
    this.subscribers.updateUserSub = this.userService.updateUser(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('User updated successfully!');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/users']);
  }
}
