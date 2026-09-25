import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { McqQuestionSearchComponent } from './mcq.question.search.component';
import { McqQuestionService } from '../../../services/mcq-question/mcq.question.service';
import { NotificationService } from '../../../services/utility/notification.service';

describe('McqQuestionSearchComponent generate-with-AI dialog', () => {
  let fixture: ComponentFixture<McqQuestionSearchComponent>;
  let component: McqQuestionSearchComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [McqQuestionSearchComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), DropdownModule],
      providers: [
        { provide: McqQuestionService, useValue: { generate: () => of({}), search: () => of({}) } },
        { provide: NotificationService, useValue: { sendErrorMsg: () => {} } },
        { provide: Router, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(McqQuestionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function generateFields(): HTMLElement[] {
    const dialog: HTMLElement = fixture.nativeElement.querySelector('p-dialog');
    return Array.from(dialog.querySelectorAll('p-floatlabel'));
  }

  it('wraps every field in a floating label that points at its own input', () => {
    const fields = generateFields();

    expect(fields.length).toBe(3);
    fields.forEach(field => {
      const label = field.querySelector('label')!;
      expect(label).withContext('label').toBeTruthy();
      expect(field.querySelector('#' + label.getAttribute('for'))).withContext(label.textContent!).toBeTruthy();
    });
  });

  it('no longer uses placeholders for the three fields', () => {
    const dialog: HTMLElement = fixture.nativeElement.querySelector('p-dialog');

    expect(dialog.querySelectorAll('input[placeholder]').length).toBe(0);
  });

  it('starts the difficulty dropdown empty as null so its label floats correctly', () => {
    component.openGenerateDialog();

    expect(component.generateForm.value).toEqual({ skillTag: null, difficulty: null, count: 5 });
  });
});
