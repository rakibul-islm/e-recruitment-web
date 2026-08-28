import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { AuditLogService } from '../../../services/audit-log/audit.log.service';
import { AuditLog } from '../../../services/audit-log/domain/audit.log.domain';

interface ChangedFieldEntry {
  field: string;
  type?: 'scalar' | 'collection';
  oldValue?: string | null;
  newValue?: string | null;
  unchanged?: string[];
  removed?: string[];
  added?: string[];
}

@Component({
  selector: 'app-audit-log-view',
  templateUrl: './audit.log.view.component.html'
})
export class AuditLogViewComponent extends BaseComponent implements OnInit {
  auditLog: AuditLog = new AuditLog();
  auditLogId!: number;
  changedFieldEntries: ChangedFieldEntry[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auditLogService: AuditLogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.auditLogId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchAuditLog();
  }

  fetchAuditLog(): void {
    this.subscribers.findAuditLogSub = this.auditLogService.findAuditLogById(this.auditLogId).subscribe(response => {
      this.auditLog = response?.obj;
      this.changedFieldEntries = this.parseChangedFields(this.auditLog?.changedFields);
    });
  }

  parseChangedFields(raw: string | undefined): ChangedFieldEntry[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  navigateToSearch(): void {
    this.router.navigate(['/audit-logs']);
  }
}
