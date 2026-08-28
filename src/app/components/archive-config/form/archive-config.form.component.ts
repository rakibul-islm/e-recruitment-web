import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../base.component';
import { ArchiveConfigService } from '../../../services/archive-config/archive-config.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { ArchiveConfig, ArchiveConfigRequest } from '../../../services/archive-config/domain/archive-config.domain';

@Component({
  selector: 'app-archive-config-form',
  templateUrl: './archive-config.form.component.html'
})
export class ArchiveConfigFormComponent extends BaseComponent implements OnInit {
  archiveConfigForm!: FormGroup;
  archiveConfigId?: number;

  sourceTableOptions: { label: string; value: string }[] = [];
  archiveSchemaOptions: { label: string; value: string }[] = [];
  dateColumnOptions: { label: string; value: string }[] = [];
  whereConditionBuilderVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private archiveConfigService: ArchiveConfigService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchSourceTableOptions();
    this.fetchArchiveSchemaOptions();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.archiveConfigId = Number(paramMap.get('id'));
      this.archiveConfigId ? this.fetchArchiveConfig(this.archiveConfigId) : this.prepareForm();
    });
  }

  // Populated from the schema itself, uppercased since some dialects (e.g. Postgres) report table names in lowercase.
  fetchSourceTableOptions(): void {
    this.subscribers.listSourceTablesSub = this.archiveConfigService.listSourceTables()
    .subscribe(response => {
      this.sourceTableOptions = (response?.list || []).map((table: string) => {
        const upper = table.toUpperCase();
        return { label: upper, value: upper };
      });
    });
  }

  fetchArchiveSchemaOptions(): void {
    this.subscribers.listArchiveSchemasSub = this.archiveConfigService.listArchiveSchemas()
    .subscribe(response => {
      this.archiveSchemaOptions = (response?.list || []).map((schema: string) => ({ label: schema, value: schema }));
    });
  }

  // Refetched whenever the selected source table changes, since a date column has to be one of that
  // table's own columns. No synthetic "default" placeholder: every table already has a real
  // created_on column (every entity extends the same base class), so it shows up in this list on
  // its own - an empty-string option here would collide with p-floatLabel's "empty means unfilled"
  // check, resting the label on top of whatever text the empty-valued option displays.
  fetchDateColumnOptions(sourceTable: string): void {
    if (!sourceTable) {
      this.dateColumnOptions = [];
      return;
    }
    this.subscribers.listDateColumnsSub = this.archiveConfigService.listDateColumns(sourceTable)
    .subscribe(response => {
      const columns: string[] = response?.list || [];
      this.dateColumnOptions = columns.map((column: string) => ({ label: column, value: column }));
    });
  }

  prepareForm(formData?: ArchiveConfig): void {
    formData = formData || new ArchiveConfig();

    this.archiveConfigForm = this.formBuilder.group({
      sourceTable: [formData.sourceTable, Validators.required],
      archiveSchema: [formData.archiveSchema, Validators.required],
      archiveTable: [formData.archiveTable, Validators.required],
      dateColumn: [formData.dateColumn],
      retentionDays: [formData.retentionDays, [Validators.required, Validators.min(1)]],
      enabled: [formData.enabled ?? true],
      description: [formData.description],
      whereCondition: [{ value: formData.whereCondition, disabled: true }]
    });

    this.subscribers.sourceTableChangeSub = this.archiveConfigForm.get('sourceTable')!.valueChanges
      .subscribe(sourceTable => {
        // A date column picked for the previous source table won't necessarily exist on the new one.
        this.archiveConfigForm.get('dateColumn')!.setValue('', { emitEvent: false });
        this.fetchDateColumnOptions(sourceTable);
      });

    if (formData.sourceTable) {
      this.fetchDateColumnOptions(formData.sourceTable);
    }
  }

  fetchArchiveConfig(id: number): void {
    this.subscribers.findArchiveConfigSub = this.archiveConfigService.findArchiveConfigById(id)
    .subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.archiveConfigForm)) { return; }

    const payload: ArchiveConfigRequest = this.archiveConfigForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => {
      this.archiveConfigId ? this.updateArchiveConfig({ ...payload, id: this.archiveConfigId }) : this.createArchiveConfig(payload);
    });
  }

  createArchiveConfig(payload: ArchiveConfigRequest): void {
    this.subscribers.createArchiveConfigSub = this.archiveConfigService.createArchiveConfig(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg(this.translate.instant('archiveConfig.createSuccess'));
      this.navigateToSearch();
    });
  }

  updateArchiveConfig(payload: ArchiveConfigRequest): void {
    this.subscribers.updateArchiveConfigSub = this.archiveConfigService.updateArchiveConfig(payload)
    .subscribe(() => {
      this.notificationService.sendSuccessMsg(this.translate.instant('archiveConfig.updateSuccess'));
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/archive-configs']);
  }

  openWhereConditionBuilder(): void {
    this.whereConditionBuilderVisible = true;
  }

  onWhereConditionApplied(condition: string): void {
    this.archiveConfigForm.get('whereCondition')!.setValue(condition);
  }
}
