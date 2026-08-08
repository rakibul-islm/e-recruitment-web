import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { UserGroupService } from '../../../services/user-group/user-group.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { UserGroup } from '../../../services/user-group/domain/user-group.domain';

@Component({
  selector: 'app-user-group-view',
  templateUrl: './user-group.view.component.html'
})
export class UserGroupViewComponent extends BaseComponent implements OnInit {
  userGroup: UserGroup = new UserGroup();
  userGroupId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userGroupService: UserGroupService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.userGroupId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchUserGroup();
  }

  fetchUserGroup(): void {
    this.subscribers.findUserGroupSub = this.userGroupService.findUserGroupById(this.userGroupId).subscribe(response => {
      this.userGroup = response?.obj;
    });
  }

  deleteUserGroup(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteUserGroupSub = this.userGroupService.deleteUserGroup(this.userGroupId).subscribe(() => {
          this.notificationService.sendSuccessMsg('User group deleted successfully!');
          this.navigateToSearch();
        });
      },
      null,
      `Are you sure you want to delete user group "${this.userGroup.name}"?`
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/user-groups']);
  }
}
