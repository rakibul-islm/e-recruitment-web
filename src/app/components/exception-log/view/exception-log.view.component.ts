import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { ExceptionLogService } from '../../../services/exception-log/exception-log.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { ExceptionLog } from '../../../services/exception-log/domain/exception-log.domain';

@Component({
  selector: 'app-exception-log-view',
  templateUrl: './exception-log.view.component.html'
})
export class ExceptionLogViewComponent extends BaseComponent implements OnInit {
  exceptionLog: ExceptionLog = new ExceptionLog();
  exceptionLogId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exceptionLogService: ExceptionLogService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.exceptionLogId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchExceptionLog();
  }

  fetchExceptionLog(): void {
    this.subscribers.findExceptionLogSub = this.exceptionLogService.findExceptionLogById(this.exceptionLogId).subscribe(response => {
      this.exceptionLog = response?.obj;
    });
  }

  deleteExceptionLog(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteExceptionLogSub = this.exceptionLogService.deleteExceptionLog(this.exceptionLogId).subscribe(() => {
          this.notificationService.sendSuccessMsg('Exception log deleted successfully!');
          this.navigateToSearch();
        });
      },
      null,
      `Are you sure you want to delete this exception log entry?`
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/exception-logs']);
  }
}
