import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { McqQuestionViewComponent } from './mcq.question.view.component';
import { McqQuestionService } from '../../../services/mcq-question/mcq.question.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { NotificationService } from '../../../services/utility/notification.service';

describe('McqQuestionViewComponent approve', () => {
  let fixture: ComponentFixture<McqQuestionViewComponent>;
  let component: McqQuestionViewComponent;
  let service: jasmine.SpyObj<McqQuestionService>;
  let router: jasmine.SpyObj<Router>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('McqQuestionService', ['findQuestionById', 'updateQuestion']);
    service.findQuestionById.and.returnValue(of({ obj: { id: 7, questionText: 'Q', status: 'DRAFT' } }));
    service.updateQuestion.and.returnValue(of({}));
    router = jasmine.createSpyObj('Router', ['navigate']);
    notifications = jasmine.createSpyObj('NotificationService', ['sendSuccessMsg']);

    TestBed.configureTestingModule({
      declarations: [McqQuestionViewComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: McqQuestionService, useValue: service },
        { provide: CommonConfirmDialogService, useValue: { confirm: (onConfirm: () => void) => onConfirm() } },
        { provide: NotificationService, useValue: notifications },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(McqQuestionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks the question approved and goes back to the question search page', () => {
    component.approve();

    expect(service.updateQuestion).toHaveBeenCalledWith(jasmine.objectContaining({ id: 7, status: 'APPROVED' }));
    expect(notifications.sendSuccessMsg).toHaveBeenCalledWith('mcqQuestion.approveSuccess');
    expect(router.navigate).toHaveBeenCalledWith(['/mcq-questions']);
  });

  it('does not leave the page until the server has confirmed the approval', () => {
    const response = new Subject<unknown>();
    service.updateQuestion.and.returnValue(response.asObservable());

    component.approve();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(notifications.sendSuccessMsg).not.toHaveBeenCalled();

    response.next({});
    expect(router.navigate).toHaveBeenCalledWith(['/mcq-questions']);
  });
});
