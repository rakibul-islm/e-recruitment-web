import { Directive, OnDestroy } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';

@Directive()
export abstract class BaseComponent implements OnDestroy {
  subscribers: any = {};
  hasOwnProperty: (v: string | number | symbol) => boolean;
  isFormDataChanged: boolean = false;

  constructor() {
    this.hasOwnProperty = (v: string | number | symbol) => Object.prototype.hasOwnProperty.call(this, v);
  }

  // Lifecycle Hook - Cleanup
  ngOnDestroy(): void {
    // Clean up the subscribers or any other resources
    Object.values(this.subscribers).forEach((subscription: any) => subscription.unsubscribe());
    this.subscribers = {};
  }

  // Utility Methods
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

  // Path Utilities
  currentPath(location: Location, stripParmms: boolean = false): string {
    const path = location.path();
    return stripParmms ? path.split('?')[0] : path;
  }

  makeblob(dataURL: any): Blob {
    // Convert dataURL to a Blob
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

  protected markFormGroupAsUnTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => control.markAsUntouched());
  }

  protected checkIfFormDataChanged(formGroup: FormGroup): void {
    // Check if form data has changed
    this.isFormDataChanged = formGroup.dirty;
  }

  // Binary String to Blob Conversion
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

  // Helper Methods
  isEmpty(obj: any): boolean {
    return obj == null || Object.keys(obj).length === 0;
  }

  numberOnly(event: any): boolean {
    // Allow only numeric input
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
