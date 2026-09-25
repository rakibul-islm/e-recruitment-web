import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { RecruiterApplicationRegisterComponent } from './recruiter.application.register.component';
import { RecruiterApplicationService } from '../../../services/recruiter-application/recruiter.application.service';
import { OrganizationTypeService } from '../../../services/organization-type/organization.type.service';
import { NotificationService } from '../../../services/utility/notification.service';

const REQUIRED_FIELDS = [
  'fullName', 'email', 'phone', 'organizationName', 'organizationType',
  'organizationAddress', 'organizationPhone', 'organizationEmail', 'jobTitle'
];

const VALID_VALUES = {
  fullName: 'Nadia Rahman',
  email: 'nadia@acme.example.com',
  phone: '01700000000',
  organizationName: 'Acme Ltd',
  organizationType: 'Private Limited Company',
  organizationAddress: 'Dhaka',
  organizationPhone: '029999999',
  organizationEmail: 'hr@acme.example.com',
  jobTitle: 'HR Manager'
};

describe('RecruiterApplicationRegisterComponent required fields', () => {
  let fixture: ComponentFixture<RecruiterApplicationRegisterComponent>;
  let component: RecruiterApplicationRegisterComponent;
  let service: jasmine.SpyObj<RecruiterApplicationService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('RecruiterApplicationService', ['submit']);
    service.submit.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [RecruiterApplicationRegisterComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), DropdownModule],
      providers: [
        { provide: RecruiterApplicationService, useValue: service },
        { provide: OrganizationTypeService, useValue: { list: () => of({ list: [] }), create: () => of({}) } },
        { provide: NotificationService, useValue: { sendErrorMsg: () => {} } },
        { provide: Router, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(RecruiterApplicationRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires the important fields and leaves website, size and message optional', () => {
    const controls = component.registerForm.controls;

    REQUIRED_FIELDS.forEach(name => expect(controls[name].valid).withContext(name).toBeFalse());
    ['organizationWebsite', 'organizationSize', 'message'].forEach(name => expect(controls[name].valid).withContext(name).toBeTrue());
  });

  it('does not submit an empty form and shows a message for every missing important field', () => {
    component.submit();
    fixture.detectChanges();

    expect(service.submit).not.toHaveBeenCalled();
    const shown = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.p-error')).map(e => e.textContent!.trim());
    ['fullNameRequired', 'emailRequired', 'phoneRequired', 'organizationNameRequired', 'organizationTypeRequired',
      'organizationAddressRequired', 'organizationPhoneRequired', 'organizationEmailRequired', 'jobTitleRequired']
      .forEach(key => expect(shown).withContext(key).toContain('recruiterApplication.' + key));
  });

  it('rejects each single missing important field', () => {
    REQUIRED_FIELDS.forEach(name => {
      component.registerForm.reset({ ...VALID_VALUES, [name]: '' });
      component.submit();
    });

    expect(service.submit).not.toHaveBeenCalled();
  });

  it('submits once everything important is filled in', () => {
    component.registerForm.patchValue(VALID_VALUES);

    component.submit();

    expect(service.submit).toHaveBeenCalledTimes(1);
    expect(component.submitted).toBeTrue();
  });

  it('rejects a malformed organization phone or email', () => {
    component.registerForm.patchValue({ ...VALID_VALUES, organizationPhone: 'abc', organizationEmail: 'not-an-email' });

    component.submit();

    expect(service.submit).not.toHaveBeenCalled();
  });
});
