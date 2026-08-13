import { Directive, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { TableLazyLoadEvent } from 'primeng/table';
import { NotificationService } from '../services/utility/notification.service';

@Directive()
export abstract class BaseComponent implements OnDestroy {
  subscribers: any = {};
  hasOwnProperty: (v: string | number | symbol) => boolean;
  isFormDataChanged: boolean = false;
  protected notificationService = inject(NotificationService);

  totalRecords: number = 0;
  loading: boolean = false;
  rows: number = 10;
  activeTabIndex: number = 0;

  private filterFormStorageKey: string | null = null;
  private preserveFiltersOnDestroy: boolean = false;

  constructor() {
    this.hasOwnProperty = (v: string | number | symbol) => Object.prototype.hasOwnProperty.call(this, v);
  }

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

  isFunction(value: any): boolean {
    return typeof value === 'function';
  }

  isArray(arr: any): boolean {
    return Array.isArray(arr);
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  isBlankObject(value: any): boolean {
    return value && typeof value === 'object' && Object.keys(value).length === 0;
  }

  currentPath(location: Location, stripParmms: boolean = false): string {
    const path = location.path();
    return stripParmms ? path.split('?')[0] : path;
  }

  makeblob(dataURL: any): Blob {
    const binary = atob(dataURL.split(',')[1]);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return new Blob([view]);
  }

  protected markFormGroupAsTouched(group: FormGroup | FormArray): void {
    if (group instanceof FormGroup) {
      Object.values(group.controls).forEach(control => control.markAsTouched());
    } else if (group instanceof FormArray) {
      group.controls.forEach(control => this.markFormGroupAsTouched(control as FormGroup));
    }
  }

  // Marks controls touched and surfaces a toast if the form is invalid.
  protected isFormInvalid(form: FormGroup, message: string = 'Please fill in all required fields correctly.'): boolean {
    this.markFormGroupAsTouched(form);
    if (form.invalid) {
      this.notificationService.sendErrorMsg(message);
      return true;
    }
    return false;
  }

  protected markFormGroupAsUnTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => control.markAsUntouched());
  }

  protected checkIfFormDataChanged(formGroup: FormGroup): void {
    this.isFormDataChanged = formGroup.dirty;
  }

  protected binaryStringToBlob(binaryString: string): Blob {
    const byteCharacters = atob(binaryString);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays);
  }

  isEmpty(obj: any): boolean {
    return obj == null || Object.keys(obj).length === 0;
  }

  numberOnly(event: any): boolean {
    const regex = /^[0-9]*$/;
    if (!regex.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9]/g, '');
      return false;
    }
    return true;
  }

  getDateFormattedString(date: Date): string {
    if (date) {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    }
    return '';
  }

  roundToDecimal(num: number, toDecimalPoint: number = 2): number {
    return parseFloat(num.toFixed(toDecimalPoint));
  }
}
