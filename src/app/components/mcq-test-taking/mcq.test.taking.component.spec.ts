import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { McqTestTakingComponent } from './mcq.test.taking.component';
import { McqTestAssignmentService } from '../../services/mcq-test-assignment/mcq.test.assignment.service';
import { CommonConfirmDialogService } from '../../services/utility/common.confirm.dialog.service';
import { NotificationService } from '../../services/utility/notification.service';
import { AuthService } from '../../services/utility/security/auth.service';

describe('McqTestTakingComponent violations', () => {
  let fixture: ComponentFixture<McqTestTakingComponent>;
  let component: McqTestTakingComponent;
  let service: jasmine.SpyObj<McqTestAssignmentService>;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let notifications: jasmine.SpyObj<NotificationService>;

  const violationResponse = (action: string, violationCount: number) =>
    of({ obj: { counted: true, violationCount, limit: 3, action } });

  beforeEach(() => {
    service = jasmine.createSpyObj('McqTestAssignmentService', ['start', 'getQuestions', 'reportViolation']);
    service.start.and.returnValue(of({ obj: { id: 5, status: 'IN_PROGRESS', currentQuestionIndex: 0 } }));
    service.getQuestions.and.returnValue(of({ list: [{ id: 1, questionText: 'Q1', options: [] }] }));
    auth = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
    auth.getToken.and.returnValue('token');
    router = jasmine.createSpyObj('Router', ['navigate']);
    notifications = jasmine.createSpyObj('NotificationService', ['sendErrorMsg', 'sendSuccessMsg']);

    TestBed.configureTestingModule({
      declarations: [McqTestTakingComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: McqTestAssignmentService, useValue: service },
        { provide: CommonConfirmDialogService, useValue: { confirm: () => {} } },
        { provide: NotificationService, useValue: notifications },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '5' } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(McqTestTakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('reports a tab switch and shows the warning with the remaining allowance', () => {
    service.reportViolation.and.returnValue(violationResponse('WARNED', 1));

    spyOnProperty(document, 'hidden', 'get').and.returnValue(true);

    component.onVisibilityChange();

    expect(service.reportViolation).toHaveBeenCalledOnceWith(5, 'TAB_HIDDEN', undefined);
    expect(component.violationWarning?.violationType).toBe('TAB_HIDDEN');
    expect(component.violationWarning?.violationCount).toBe(1);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('blocks a copy shortcut and reports which keys were pressed', () => {
    service.reportViolation.and.returnValue(violationResponse('WARNED', 1));
    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, cancelable: true });

    component.onKeydown(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(service.reportViolation).toHaveBeenCalledOnceWith(5, 'BLOCKED_SHORTCUT', 'Ctrl+C');
  });

  it('ignores keys that are not blocked shortcuts', () => {
    const event = new KeyboardEvent('keydown', { key: 'c', cancelable: true });

    component.onKeydown(event);

    expect(event.defaultPrevented).toBeFalse();
    expect(service.reportViolation).not.toHaveBeenCalled();
  });

  it('logs the candidate out and goes to login when the server ends the test', () => {
    service.reportViolation.and.returnValue(violationResponse('TERMINATED', 4));

    component.onContextMenu(new MouseEvent('contextmenu', { cancelable: true }));

    expect(component.terminated).toBeTrue();
    expect(component.violationWarning).toBeNull();
    expect(auth.logout).toHaveBeenCalled();
    expect(notifications.sendErrorMsg).toHaveBeenCalledWith('mcqTestTaking.violation.terminatedNotice');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not log out twice when the stream already signed the candidate out', () => {
    auth.getToken.and.returnValue(null);
    service.reportViolation.and.returnValue(violationResponse('TERMINATED', 4));

    component.onWindowBlur();

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not count a burst the server already merged into an earlier incident', () => {
    service.reportViolation.and.returnValue(of({ obj: { counted: false, violationCount: 1, limit: 3, action: 'NONE' } }));

    component.onWindowBlur();

    expect(component.violationWarning).toBeNull();
  });

  it('stops reporting once the test is no longer in progress', () => {
    component.assignment.status = 'SUBMITTED';

    component.onWindowBlur();
    component.onCopyOrCut(new Event('copy', { cancelable: true }));

    expect(service.reportViolation).not.toHaveBeenCalled();
  });

  it('closes the warning and asks for full screen again when acknowledged', () => {
    service.reportViolation.and.returnValue(violationResponse('WARNED', 2));
    component.onWindowBlur();
    expect(component.violationWarning).not.toBeNull();

    component.acknowledgeWarning();

    expect(component.violationWarning).toBeNull();
  });
});
