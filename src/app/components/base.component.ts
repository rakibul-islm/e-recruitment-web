import { Directive, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';
import { NotificationService } from '../services/utility/notification.service';

@Directive()
export abstract class BaseComponent implements OnDestroy {
  subscribers: any = {};
  protected notificationService = inject(NotificationService);
  private location = inject(Location);

  totalRecords: number = 0;
  loading: boolean = false;
  rows: number = 10;
  activeTabIndex: number = 0;

  private filterFormStorageKey: string | null = null;
  private preserveFiltersOnDestroy: boolean = false;

  ngOnDestroy(): void {
    Object.values(this.subscribers).forEach((subscription: any) => subscription.unsubscribe());
    this.subscribers = {};

    if (this.filterFormStorageKey && !this.preserveFiltersOnDestroy) {
      sessionStorage.removeItem(this.filterFormStorageKey);
    }
  }

  protected registerFilterForm(key: string, form: FormGroup): void {
    this.filterFormStorageKey = key;

    const saved = sessionStorage.getItem(key);
    if (saved) {
      form.patchValue(JSON.parse(saved));
    }

    this.subscribers[`filterForm_${key}`] = form.valueChanges.subscribe(value => {
      sessionStorage.setItem(key, JSON.stringify(value));
    });
  }

  protected clearFilterForm(form: FormGroup): void {
    form.reset();
    if (this.filterFormStorageKey) {
      sessionStorage.removeItem(this.filterFormStorageKey);
    }
  }

  protected preserveFiltersOnNavigate(): void {
    this.preserveFiltersOnDestroy = true;
  }

  navigateToAuditLog(router: Router, entityType: string, entityId: number | string | null | undefined): void {
    router.navigate(['/audit-logs'], { queryParams: { entityType, entityId } });
  }

  goBack(): void {
    this.location.back();
  }

  protected buildSearchParams(form: FormGroup, event: TableLazyLoadEvent): Map<any, any> {
    const rows = event.rows || this.rows;
    const page = Math.floor((event.first || 0) / rows);

    const params = new Map<any, any>();
    params.set('page', page);
    params.set('size', rows);
    params.set('isPageable', true);

    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value instanceof Date ? this.formatDateParam(value) : value);
      }
    });

    return params;
  }

  private formatDateParam(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  protected markFormGroupAsTouched(group: FormGroup | FormArray): void {
    if (group instanceof FormGroup) {
      Object.values(group.controls).forEach(control => control.markAsTouched());
    } else if (group instanceof FormArray) {
      group.controls.forEach(control => this.markFormGroupAsTouched(control as FormGroup));
    }
  }

  // Marks controls touched and surfaces a toast if the form is invalid. `message` is an i18n key,
  // resolved by NotificationService itself.
  protected isFormInvalid(form: FormGroup, message: string = 'common.formInvalidMessage'): boolean {
    this.markFormGroupAsTouched(form);
    if (form.invalid) {
      this.notificationService.sendErrorMsg(message);
      return true;
    }
    return false;
  }
}
