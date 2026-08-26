import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { ArchiveConfigService } from '../../../services/archive-config/archive-config.service';

@Component({
  selector: 'app-archive-config-archived-data',
  templateUrl: './archive-config.archived-data.component.html'
})
export class ArchiveConfigArchivedDataComponent extends BaseComponent implements OnInit {
  archiveConfigId!: number;
  sourceTable: string | null = null;
  columns: string[] = [];
  archivedRows: any[] = [];

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private archiveConfigService: ArchiveConfigService
  ) {
    super();
  }

  ngOnInit(): void {
    this.archiveConfigId = Number(this.route.snapshot.paramMap.get('id'));
    this.sourceTable = this.route.snapshot.queryParamMap.get('sourceTable');
  }

  // No formGroup filter here - just page/size, straight through to the archive table itself.
  fetchArchivedData(event: TableLazyLoadEvent): void {
    this.loading = true;
    const pageSize = event.rows || this.rows;
    const page = Math.floor((event.first || 0) / pageSize);

    this.subscribers.findArchivedDataSub = this.archiveConfigService.findArchivedData(this.archiveConfigId, page, pageSize)
    .subscribe({
      next: (response) => {
        this.columns = response?.obj?.columns || [];
        this.archivedRows = response?.obj?.rows || [];
        this.totalRecords = response?.obj?.totalElements || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
