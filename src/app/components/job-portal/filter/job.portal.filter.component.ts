import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface JobPortalFilterValue {
  [key: string]: string;
}

@Component({
  selector: 'app-job-portal-filter',
  templateUrl: './job.portal.filter.component.html',
  styleUrls: ['./job.portal.filter.component.scss']
})
export class JobPortalFilterComponent implements OnChanges {
  filterForm!: FormGroup;
  detailDialogVisible = false;

  @Input() initialFilters: JobPortalFilterValue | null = null;
  @Input() boxed = true;
  @Output() filtersChanged = new EventEmitter<JobPortalFilterValue>();

  constructor(private formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({
      jobTitle_like: [''],
      skills_like: [''],
      organizationName_like: [''],
      jobLocation_like: [''],
      category_like: [''],
      employmentStatus_like: [''],
      experience_like: [''],
      workPlace_like: ['']
    });
  }

  ngOnChanges(): void {
    if (this.initialFilters) {
      this.filterForm.patchValue(this.initialFilters, { emitEvent: false });
    }
  }

  // Filter chips for every active detail filter (the keyword box shows its own state).
  get activeFilters(): { key: string; labelKey: string; value: string }[] {
    const labels: Record<string, string> = {
      jobLocation_like: 'jobPortal.location',
      organizationName_like: 'jobPortal.organization',
      skills_like: 'jobPortal.skills',
      category_like: 'jobAlert.category',
      employmentStatus_like: 'jobPortal.employmentType',
      experience_like: 'jobPortal.experience',
      workPlace_like: 'jobPortal.workplace'
    };
    return Object.keys(labels)
      .map(key => ({ key, labelKey: labels[key], value: this.filterForm?.get(key)?.value }))
      .filter(f => !!f.value);
  }

  search(): void {
    this.emitFilters();
  }

  applyDetailSearch(): void {
    this.detailDialogVisible = false;
    this.emitFilters();
  }

  removeFilter(key: string): void {
    this.filterForm.get(key)?.setValue('');
    this.emitFilters();
  }

  clearDetailFilters(): void {
    this.filterForm.patchValue({
      jobTitle_like: '',
      jobLocation_like: '',
      organizationName_like: '',
      skills_like: '',
      category_like: '',
      employmentStatus_like: '',
      experience_like: '',
      workPlace_like: ''
    });
    this.emitFilters();
  }

  private emitFilters(): void {
    const filters: JobPortalFilterValue = {};
    Object.entries(this.filterForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filters[key] = value as string;
      }
    });
    this.filtersChanged.emit(filters);
  }
}
