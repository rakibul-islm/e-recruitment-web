import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../base.component';
import { UserService } from '../../../../services/user/user.service';
import { CommonConfirmDialogService } from '../../../../services/utility/common.confirm.dialog.service';
import { UserAccount } from '../../../../services/user/domain/user.domain';

@Component({
  selector: 'app-user-view',
  templateUrl: './user.view.component.html'
})
export class UserViewComponent extends BaseComponent implements OnInit {
  user: UserAccount = new UserAccount();
  userId!: number;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private userService: UserService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchUser();
  }

  fetchUser(): void {
    this.subscribers.findUserSub = this.userService.findUserById(this.userId).subscribe(response => {
      this.user = response?.obj;
    });
  }

  deleteUser(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteUserSub = this.userService.deleteUser(this.userId).subscribe(() => {
          this.notificationService.sendSuccessMsg(this.translate.instant('user.deleteSuccess'));
          this.navigateToSearch();
        });
      },
      null,
      this.translate.instant('user.deleteConfirm', { name: this.user.fullName })
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/users']);
  }
}
