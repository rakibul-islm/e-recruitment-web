import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { RoleService } from '../../../services/role/role.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Role } from '../../../services/role/domain/role.domain';

@Component({
  selector: 'app-role-view',
  templateUrl: './role.view.component.html'
})
export class RoleViewComponent extends BaseComponent implements OnInit {
  role: Role = new Role();
  roleId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.roleId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchRole();
  }

  fetchRole(): void {
    this.subscribers.findRoleSub = this.roleService.findRoleById(this.roleId).subscribe(response => {
      this.role = response?.obj;
    });
  }

  deleteRole(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteRoleSub = this.roleService.deleteRole(this.roleId).subscribe(() => {
          this.notificationService.sendSuccessMsg('Role deleted successfully!');
          this.navigateToSearch();
        });
      },
      null,
      `Are you sure you want to delete role "${this.role.name}"?`
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/roles']);
  }
}
