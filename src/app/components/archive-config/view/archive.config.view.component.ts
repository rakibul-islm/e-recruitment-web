import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { ArchiveConfigService } from '../../../services/archive-config/archive.config.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { ArchiveConfig } from '../../../services/archive-config/domain/archive.config.domain';

@Component({
  selector: 'app-archive-config-view',
  templateUrl: './archive.config.view.component.html'
})
export class ArchiveConfigViewComponent extends BaseComponent implements OnInit {
  archiveConfig: ArchiveConfig = new ArchiveConfig();
  archiveConfigId!: number;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private archiveConfigService: ArchiveConfigService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.archiveConfigId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchArchiveConfig();
  }

  fetchArchiveConfig(): void {
    this.subscribers.findArchiveConfigSub = this.archiveConfigService.findArchiveConfigById(this.archiveConfigId).subscribe(response => {
      this.archiveConfig = response?.obj;
    });
  }

  deleteArchiveConfig(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteArchiveConfigSub = this.archiveConfigService.deleteArchiveConfig(this.archiveConfigId).subscribe(() => {
          this.notificationService.sendSuccessMsg('archiveConfig.deleteSuccess');
          this.navigateToSearch();
        });
      },
      null,
      'archiveConfig.deleteConfirm', { sourceTable: this.archiveConfig.sourceTable }
    );
  }

  archiveNow(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.archiveNowSub = this.archiveConfigService.archiveNow(this.archiveConfigId).subscribe(response => {
          this.notificationService.sendSuccessMsg('archiveConfig.archiveNowSuccess', { count: response?.obj ?? 0 });
        });
      },
      null,
      'archiveConfig.archiveNowConfirm', { sourceTable: this.archiveConfig.sourceTable }
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/archive-configs']);
  }
}
