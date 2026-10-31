import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { BackupService } from '../../../services/backup/backup.service';
import { DatabaseBackup, RestoreStatus } from '../../../services/backup/domain/backup.domain';
import { AuthService } from '../../../services/utility/security/auth.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { triggerDownload } from '../../../services/utility/file-download.util';

const POLL_INTERVAL_MS = 3000;
const RESTORE_POLL_INTERVAL_MS = 2000;
const RESTORE_CONFIRMATION = 'RESTORE';

@Component({
  selector: 'app-backup-search',
  templateUrl: './backup.search.component.html',
  styleUrls: ['./backup.search.component.scss']
})
export class BackupSearchComponent extends BaseComponent implements OnInit, OnDestroy {
  backups: DatabaseBackup[] = [];
  creating = false;
  uploading = false;

  restoreTarget: DatabaseBackup | null = null;
  restoreDialogVisible = false;
  confirmText = '';
  submittingRestore = false;
  restoring = false;
  lastRestore: RestoreStatus | null = null;

  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private restoreTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private backupService: BackupService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private authService: AuthService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadBackups(false);
    this.checkRestoreStatus();
  }

  override ngOnDestroy(): void {
    this.stopPolling();
    this.stopRestorePolling();
    super.ngOnDestroy();
  }

  get hasRunning(): boolean {
    return this.backups.some(b => b.status === 'RUNNING' || b.driveStatus === 'UPLOADING');
  }

  get confirmationMatches(): boolean {
    return this.confirmText === RESTORE_CONFIRMATION;
  }

  get restoreWord(): string {
    return RESTORE_CONFIRMATION;
  }

  loadBackups(silent: boolean): void {
    this.loading = !silent;
    this.subscribers.listBackupsSub?.unsubscribe();
    this.subscribers.listBackupsSub = this.backupService.listBackups().subscribe({
      next: (response) => {
        this.backups = response?.list || [];
        this.loading = false;
        this.schedulePoll();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createBackup(): void {
    this.creating = true;
    this.subscribers.createBackupSub = this.backupService.createBackup().subscribe({
      next: () => {
        this.creating = false;
        this.notificationService.sendSuccessMsg('backup.started');
        this.loadBackups(true);
      },
      error: () => {
        this.creating = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploading = true;
    this.subscribers.uploadBackupSub = this.backupService.uploadBackup(file).subscribe({
      next: () => {
        this.uploading = false;
        this.notificationService.sendSuccessMsg('backup.uploadSuccess');
        this.loadBackups(true);
      },
      error: () => {
        this.uploading = false;
      }
    });
  }

  uploadToDrive(backup: DatabaseBackup): void {
    this.subscribers.driveUploadSub = this.backupService.uploadToDrive(backup.id).subscribe(() => {
      this.notificationService.sendSuccessMsg('backup.driveUploadStarted');
      this.loadBackups(true);
    });
  }

  download(backup: DatabaseBackup): void {
    this.subscribers.downloadBackupSub = this.backupService.downloadBackup(backup.id).subscribe(blob => triggerDownload(blob, backup.fileName));
  }

  deleteBackup(backup: DatabaseBackup): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteBackupSub = this.backupService.deleteBackup(backup.id).subscribe(() => {
          this.notificationService.sendSuccessMsg('backup.deleteSuccess');
          this.loadBackups(true);
        });
      },
      null,
      'backup.deleteConfirm', { name: backup.fileName }
    );
  }

  openRestoreDialog(backup: DatabaseBackup): void {
    this.restoreTarget = backup;
    this.confirmText = '';
    this.restoreDialogVisible = true;
  }

  confirmRestore(): void {
    if (!this.restoreTarget || !this.confirmationMatches) return;
    this.submittingRestore = true;
    this.subscribers.restoreBackupSub = this.backupService.restoreBackup(this.restoreTarget.id, this.confirmText).subscribe({
      next: () => {
        this.submittingRestore = false;
        this.restoreDialogVisible = false;
        this.restoring = true;
        this.pollRestore();
      },
      error: () => {
        this.submittingRestore = false;
      }
    });
  }

  formatSize(bytes?: number): string {
    if (bytes == null) return '';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit++;
    }
    return `${value.toFixed(1)} ${units[unit]}`;
  }

  private checkRestoreStatus(): void {
    this.subscribers.restoreStatusSub = this.backupService.restoreStatus().subscribe({
      next: (response) => {
        const status: RestoreStatus | undefined = response?.obj;
        if (!status || status.phase === 'IDLE') return;
        if (status.phase === 'VALIDATING' || status.phase === 'RUNNING') {
          this.restoring = true;
          this.pollRestore();
        } else {
          this.lastRestore = status;
        }
      },
      error: () => {}
    });
  }

  private pollRestore(): void {
    this.stopRestorePolling();
    this.subscribers.restorePollSub?.unsubscribe();
    this.subscribers.restorePollSub = this.backupService.restoreStatus().subscribe({
      next: (response) => {
        const status: RestoreStatus | undefined = response?.obj;
        if (status?.phase === 'COMPLETED') {
          this.finishRestore(status, true);
        } else if (status?.phase === 'FAILED') {
          this.finishRestore(status, false);
        } else {
          this.restoreTimer = setTimeout(() => this.pollRestore(), RESTORE_POLL_INTERVAL_MS);
        }
      },
      error: () => {
        this.restoreTimer = setTimeout(() => this.pollRestore(), RESTORE_POLL_INTERVAL_MS);
      }
    });
  }

  private finishRestore(status: RestoreStatus, succeeded: boolean): void {
    this.restoring = false;
    this.lastRestore = status;
    if (succeeded) {
      this.notificationService.sendSuccessMsg('backup.restoreSuccess');
      this.authService.logout();
      this.router.navigate(['/login']);
    } else {
      this.notificationService.sendErrorMsg(status.message || 'backup.restoreFailed');
      this.loadBackups(true);
    }
  }

  private schedulePoll(): void {
    this.stopPolling();
    if (this.hasRunning) {
      this.pollTimer = setTimeout(() => this.loadBackups(true), POLL_INTERVAL_MS);
    }
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private stopRestorePolling(): void {
    if (this.restoreTimer) {
      clearTimeout(this.restoreTimer);
      this.restoreTimer = null;
    }
  }
}
