import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../base.component';
import { NotificationBroadcastService } from '../../services/notification-broadcast/notification.broadcast.service';
import { CommonConfirmDialogService } from '../../services/utility/common.confirm.dialog.service';
import { RoleOption, UserOption } from '../../services/notification-broadcast/domain/notification.broadcast.domain';

@Component({
  selector: 'app-notification-broadcast-form',
  templateUrl: './notification.broadcast.form.component.html',
  styleUrls: ['./notification.broadcast.form.component.scss']
})
export class NotificationBroadcastFormComponent extends BaseComponent implements OnInit {
  broadcastForm!: FormGroup;
  roles: RoleOption[] = [];
  userSuggestions: UserOption[] = [];
  selectedUsers: UserOption[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private notificationBroadcastService: NotificationBroadcastService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.broadcastForm = this.formBuilder.group({
      targetType: ['ALL', Validators.required],
      roleId: [null],
      userIds: [[]],
      title: ['', Validators.required],
      message: ['', Validators.required],
      sendEmail: [false]
    });

    this.fetchRoles();
  }

  fetchRoles(): void {
    this.subscribers.fetchRolesSub = this.notificationBroadcastService.listRoles()
      .subscribe(response => this.roles = response?.list || []);
  }

  searchUsers(event: { query: string }): void {
    this.subscribers.searchUsersSub = this.notificationBroadcastService.searchUsers(event.query)
      .subscribe(response => this.userSuggestions = response?.list || []);
  }

  onUsersChanged(): void {
    this.broadcastForm.get('userIds')!.setValue(this.selectedUsers.map(user => user.id));
  }

  submit(): void {
    if (this.isFormInvalid(this.broadcastForm)) { return; }

    const targetType = this.broadcastForm.get('targetType')!.value;
    if (targetType === 'ROLE' && !this.broadcastForm.get('roleId')!.value) {
      this.notificationService.sendErrorMsg('notificationBroadcast.roleRequired');
      return;
    }
    if (targetType === 'USER' && !this.broadcastForm.get('userIds')!.value?.length) {
      this.notificationService.sendErrorMsg('notificationBroadcast.userRequired');
      return;
    }

    const payload = this.broadcastForm.getRawValue();
    const confirmMessage = targetType === 'ALL' ? 'notificationBroadcast.confirmAll' : 'common.confirmDefaultMessage';

    this.commonConfirmDialogService.confirm(() => this.send(payload), null, confirmMessage);
  }

  send(payload: any): void {
    this.subscribers.sendSub = this.notificationBroadcastService.send(payload)
      .subscribe(() => {
        this.notificationService.sendSuccessMsg('notificationBroadcast.sendSuccess');
        this.broadcastForm.get('title')!.reset('');
        this.broadcastForm.get('message')!.reset('');
        this.broadcastForm.get('sendEmail')!.reset(false);
        this.broadcastForm.get('roleId')!.reset(null);
        this.broadcastForm.get('userIds')!.reset([]);
        this.selectedUsers = [];
      });
  }
}
