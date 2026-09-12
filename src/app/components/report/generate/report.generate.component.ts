import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BaseComponent } from '../../base.component';
import { ReportService } from '../../../services/report/report.service';
import { ReportDefinition, ReportFieldDef, ReportFieldOption } from '../../../services/report/domain/report.definition';
import { REPORT_DEFINITIONS } from '../../../services/report/report.definitions';
import { triggerDownload } from '../../../services/utility/file-download.util';

// Single generic component for all 4 report routes - see app.routing.module.ts's reportKey data.
@Component({
  selector: 'app-report-generate',
  templateUrl: './report.generate.component.html'
})
export class ReportGenerateComponent extends BaseComponent implements OnInit, OnDestroy {
  definition!: ReportDefinition;
  filterForm!: FormGroup;
  previewUrl: SafeResourceUrl | null = null;
  generatingFormat: 'PDF' | 'XLSX' | null = null;

  private previewObjectUrl: string | null = null;
  private previewBlob: Blob | null = null;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    super();
  }

  ngOnInit(): void {
    this.definition = REPORT_DEFINITIONS[this.route.snapshot.data['reportKey']];

    const controls: { [key: string]: any } = {};
    this.definition.fields.forEach(field => { controls[field.key] = [field.defaultValue ?? null]; });
    this.filterForm = this.formBuilder.group(controls);

    // Filter changes invalidate any cached preview.
    this.subscribers.reportFilterChangeSub = this.filterForm.valueChanges.subscribe(() => this.clearPreview());

    this.definition.fields
      .filter(field => field.asyncOptions)
      .forEach(field => this.loadAsyncOptions(field));
  }

  private loadAsyncOptions(field: ReportFieldDef): void {
    const source = field.asyncOptions!;
    let params = new HttpParams();
    source.params?.forEach((value, key) => { params = params.set(key, value); });

    this.subscribers[`asyncOptions_${field.key}`] = this.http.get<any>(source.endpoint, { params }).subscribe(response => {
      const list: any[] = response?.list || [];
      this.setFieldOptions(field.key, list.map(item => ({ label: item[source.labelField], value: item[source.valueField] })));
    });
  }

  private setFieldOptions(key: string, options: ReportFieldOption[]): void {
    const field = this.definition.fields.find(f => f.key === key);
    if (field) { field.options = options; }
  }

  preview(): void {
    if (this.generatingFormat) { return; }
    this.generatingFormat = 'PDF';

    this.subscribers.previewReportSub = this.reportService.generate(this.definition.key, this.buildParams('PDF')).subscribe({
      next: blob => {
        this.generatingFormat = null;
        this.revokePreviewUrl();
        this.previewBlob = blob;
        this.previewObjectUrl = window.URL.createObjectURL(blob);
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.previewObjectUrl);
      },
      error: () => { this.generatingFormat = null; }
    });
  }

  downloadPdf(): void {
    if (this.previewBlob) {
      triggerDownload(this.previewBlob, `${this.definition.key}-report.pdf`);
      return;
    }
    if (this.generatingFormat) { return; }
    this.generatingFormat = 'PDF';

    this.subscribers.downloadPdfReportSub = this.reportService.generate(this.definition.key, this.buildParams('PDF')).subscribe({
      next: blob => {
        this.generatingFormat = null;
        triggerDownload(blob, `${this.definition.key}-report.pdf`);
      },
      error: () => { this.generatingFormat = null; }
    });
  }

  downloadExcel(): void {
    if (this.generatingFormat) { return; }
    this.generatingFormat = 'XLSX';

    this.subscribers.downloadExcelReportSub = this.reportService.generate(this.definition.key, this.buildParams('XLSX')).subscribe({
      next: blob => {
        this.generatingFormat = null;
        triggerDownload(blob, `${this.definition.key}-report.xlsx`);
      },
      error: () => { this.generatingFormat = null; }
    });
  }

  private buildParams(format: 'PDF' | 'XLSX'): Map<any, any> {
    const params = new Map<any, any>();
    Object.entries(this.filterForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value instanceof Date ? this.formatDateParam(value) : value);
      }
    });
    params.set('format', format);
    return params;
  }

  private revokePreviewUrl(): void {
    if (this.previewObjectUrl) {
      window.URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }

  private clearPreview(): void {
    this.revokePreviewUrl();
    this.previewUrl = null;
    this.previewBlob = null;
  }

  override ngOnDestroy(): void {
    this.revokePreviewUrl();
    super.ngOnDestroy();
  }
}
