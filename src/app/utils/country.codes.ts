import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export const DEFAULT_COUNTRY_CODE = '+880';

export const COUNTRY_CODES: { label: string; value: string }[] = [
  { label: 'Bangladesh (+880)', value: '+880' },
  { label: 'India (+91)', value: '+91' },
  { label: 'Pakistan (+92)', value: '+92' },
  { label: 'Nepal (+977)', value: '+977' },
  { label: 'Sri Lanka (+94)', value: '+94' },
  { label: 'Bhutan (+975)', value: '+975' },
  { label: 'Maldives (+960)', value: '+960' },
  { label: 'Afghanistan (+93)', value: '+93' },
  { label: 'Saudi Arabia (+966)', value: '+966' },
  { label: 'United Arab Emirates (+971)', value: '+971' },
  { label: 'Qatar (+974)', value: '+974' },
  { label: 'Kuwait (+965)', value: '+965' },
  { label: 'Oman (+968)', value: '+968' },
  { label: 'Bahrain (+973)', value: '+973' },
  { label: 'Jordan (+962)', value: '+962' },
  { label: 'Lebanon (+961)', value: '+961' },
  { label: 'Turkey (+90)', value: '+90' },
  { label: 'Iran (+98)', value: '+98' },
  { label: 'Iraq (+964)', value: '+964' },
  { label: 'Egypt (+20)', value: '+20' },
  { label: 'South Africa (+27)', value: '+27' },
  { label: 'Nigeria (+234)', value: '+234' },
  { label: 'Kenya (+254)', value: '+254' },
  { label: 'United Kingdom (+44)', value: '+44' },
  { label: 'Ireland (+353)', value: '+353' },
  { label: 'France (+33)', value: '+33' },
  { label: 'Germany (+49)', value: '+49' },
  { label: 'Italy (+39)', value: '+39' },
  { label: 'Spain (+34)', value: '+34' },
  { label: 'Netherlands (+31)', value: '+31' },
  { label: 'Sweden (+46)', value: '+46' },
  { label: 'Russia (+7)', value: '+7' },
  { label: 'United States / Canada (+1)', value: '+1' },
  { label: 'Brazil (+55)', value: '+55' },
  { label: 'Mexico (+52)', value: '+52' },
  { label: 'Australia (+61)', value: '+61' },
  { label: 'New Zealand (+64)', value: '+64' },
  { label: 'China (+86)', value: '+86' },
  { label: 'Hong Kong (+852)', value: '+852' },
  { label: 'Japan (+81)', value: '+81' },
  { label: 'South Korea (+82)', value: '+82' },
  { label: 'Singapore (+65)', value: '+65' },
  { label: 'Malaysia (+60)', value: '+60' },
  { label: 'Indonesia (+62)', value: '+62' },
  { label: 'Thailand (+66)', value: '+66' },
  { label: 'Vietnam (+84)', value: '+84' },
  { label: 'Philippines (+63)', value: '+63' },
  { label: 'Myanmar (+95)', value: '+95' }
];

// Bangladesh (+880) numbers are 10 digits without the leading 0; other countries accept 6-14 digits.
// Reports the 'pattern' error so the forms' existing mobilePattern messages still apply.
function numberValidator(codeField: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const code = control.parent?.get(codeField)?.value || DEFAULT_COUNTRY_CODE;
    const pattern = code === DEFAULT_COUNTRY_CODE ? /^[0-9]{10}$/ : /^[0-9]{6,14}$/;
    return pattern.test(value) ? null : { pattern: true };
  };
}

export function withMobileValidation(form: FormGroup, field = 'mobile', codeField = 'mobileCountryCode'): void {
  const number = form.get(field);
  number?.addValidators(numberValidator(codeField));
  number?.updateValueAndValidity({ emitEvent: false });
  form.get(codeField)?.valueChanges.subscribe(() => number?.updateValueAndValidity());
}

// Numbers saved before the country code existed carry the Bangladeshi leading 0 (01712345678).
export function localMobile(code: string | undefined | null, mobile: string | undefined | null): string | undefined | null {
  return (code || DEFAULT_COUNTRY_CODE) === DEFAULT_COUNTRY_CODE && mobile && /^0[0-9]{10}$/.test(mobile) ? mobile.substring(1) : mobile;
}
