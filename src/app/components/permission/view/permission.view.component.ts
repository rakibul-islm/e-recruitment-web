import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { PermissionService } from '../../../services/permission/permission.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Permission } from '../../../services/permission/domain/permission.domain';

@Component({
  selector: 'app-permission-view',
  templateUrl: './permission.view.component.html'
})
export class PermissionViewComponent extends BaseComponent implements OnInit {
  permission: Permission = new Permission();
  permissionId!: number;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    protected permissionService: PermissionService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.routeSub = this.route.paramMap.subscribe(params => {
      this.permissionId = Number(params.get('id'));
      this.fetchPermission();
    });
  }

  fetchPermission(): void {
    this.subscribers.findPermissionSub = this.permissionService.findPermissionById(this.permissionId).subscribe(response => {
      this.permission = response?.obj;
    });
  }

  deletePermission(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deletePermissionSub = this.permissionService.deletePermission(this.permissionId).subscribe(() => {
          this.notificationService.sendSuccessMsg('permission.deleteSuccess');
          this.navigateToSearch();
        });
      },
      null,
      'permission.deleteConfirm', { name: this.permission.name }
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/permissions']);
  }
}
