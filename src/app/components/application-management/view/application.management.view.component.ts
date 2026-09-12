import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { ApplicationService } from '../../../services/application/application.service';
import { InterviewService } from '../../../services/interview/interview.service';
import { OfferService } from '../../../services/offer/offer.service';
import { OnboardingTaskService } from '../../../services/onboarding/onboarding.task.service';
import { McqTestAssignmentService } from '../../../services/mcq-test-assignment/mcq.test.assignment.service';
import { McqTestService } from '../../../services/mcq-test/mcq.test.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Application, ApplicationStatusHistory, APPLICATION_STATUS_OPTIONS } from '../../../services/application/domain/application.domain';
import { Interview, INTERVIEW_MODE_OPTIONS } from '../../../services/interview/domain/interview.domain';
import { Offer } from '../../../services/offer/domain/offer.domain';
import { OnboardingTask } from '../../../services/onboarding/domain/onboarding.task.domain';
import { McqTestAssignment } from '../../../services/mcq-test-assignment/domain/mcq.test.assignment.domain';
import { McqTest } from '../../../services/mcq-test/domain/mcq.test.domain';
import { triggerDownload } from '../../../services/utility/file-download.util';

@Component({
  selector: 'app-application-management-view',
  templateUrl: './application.management.view.component.html'
})
export class ApplicationManagementViewComponent extends BaseComponent implements OnInit {
  application: Application = new Application();
  history: ApplicationStatusHistory[] = [];
  applicationId!: number;
  statusOptions = APPLICATION_STATUS_OPTIONS;
  statusForm!: FormGroup;
  updatingStatus = false;

  interviews: Interview[] = [];
  interviewModeOptions = INTERVIEW_MODE_OPTIONS;
  interviewDialogVisible = false;
  interviewForm!: FormGroup;
  schedulingInterview = false;

  offers: Offer[] = [];
  offerDialogVisible = false;
  offerForm!: FormGroup;
  savingOffer = false;

  onboardingTasks: OnboardingTask[] = [];
  taskDialogVisible = false;
  taskForm!: FormGroup;
  savingTask = false;

  mcqAssignments: McqTestAssignment[] = [];
  activeTestOptions: { label: string; value: number }[] = [];
  assignTestDialogVisible = false;
  assignTestForm!: FormGroup;
  assigningTest = false;
  reviewQuestions: any[] = [];
  reviewDialogVisible = false;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private offerService: OfferService,
    private onboardingTaskService: OnboardingTaskService,
    private mcqTestAssignmentService: McqTestAssignmentService,
    private mcqTestService: McqTestService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.statusForm = this.formBuilder.group({ status: [''], note: [''] });
    this.interviewForm = this.formBuilder.group({
      title: [''], scheduledAt: [null], durationMinutes: [60], mode: ['VIDEO'], location: [''], interviewerUserIds: ['']
    });
    this.offerForm = this.formBuilder.group({
      position: [''], salaryOffered: [''], startDate: [null], expiryDate: [null], notes: ['']
    });
    this.taskForm = this.formBuilder.group({ title: [''], description: [''], dueDate: [null] });
    this.assignTestForm = this.formBuilder.group({ mcqTestId: [null, Validators.required], scheduledAt: [null], scheduledEndAt: [null] });

    this.fetchApplication();
    this.fetchHistory();
    this.fetchInterviews();
    this.fetchOffers();
    this.fetchOnboardingTasks();
    this.fetchMcqAssignments();
  }

  fetchApplication(): void {
    this.subscribers.findApplicationSub = this.applicationService.findApplicationById(this.applicationId).subscribe(response => {
      this.application = response?.obj;
      this.statusForm.patchValue({ status: this.application.status });
    });
  }

  fetchHistory(): void {
    this.subscribers.historySub = this.applicationService.fetchHistory(this.applicationId).subscribe(response => {
      this.history = response?.list || [];
    });
  }

  changeStatus(): void {
    this.commonConfirmDialogService.confirm(() => {
      this.updatingStatus = true;
      this.subscribers.changeStatusSub = this.applicationService
        .changeStatus(this.applicationId, this.statusForm.getRawValue())
        .subscribe({
          next: () => {
            this.updatingStatus = false;
            this.notificationService.sendSuccessMsg('applicationManagement.statusUpdateSuccess');
            this.statusForm.patchValue({ note: '' });
            this.fetchApplication();
            this.fetchHistory();
          },
          error: () => { this.updatingStatus = false; }
        });
    });
  }

  downloadCv(): void {
    this.subscribers.downloadCvSub = this.applicationService.downloadCv(this.applicationId).subscribe(blob => {
      triggerDownload(blob, `CV-${this.application.candidateName}.pdf`);
    });
  }

  // --- Interviews ---

  fetchInterviews(): void {
    this.subscribers.interviewsSub = this.interviewService.findByApplication(this.applicationId).subscribe(response => {
      this.interviews = response?.list || [];
    });
  }

  openScheduleInterview(): void {
    this.interviewForm.reset({ durationMinutes: 60, mode: 'VIDEO' });
    this.interviewDialogVisible = true;
  }

  scheduleInterview(): void {
    this.schedulingInterview = true;
    const raw = this.interviewForm.value;
    const interviewerUserIds = String(raw.interviewerUserIds || '')
      .split(',').map((s: string) => s.trim()).filter((s: string) => s).map((s: string) => Number(s));

    this.subscribers.scheduleSub = this.interviewService.schedule({
      applicationId: this.applicationId,
      title: raw.title,
      scheduledAt: raw.scheduledAt,
      durationMinutes: raw.durationMinutes,
      mode: raw.mode,
      location: raw.location,
      interviewerUserIds
    }).subscribe({
      next: () => {
        this.schedulingInterview = false;
        this.interviewDialogVisible = false;
        this.notificationService.sendSuccessMsg('applicationManagement.interviewScheduleSuccess');
        this.fetchInterviews();
        this.fetchApplication();
        this.fetchHistory();
      },
      error: () => { this.schedulingInterview = false; }
    });
  }

  markInterviewCompleted(interview: Interview): void {
    this.subscribers.completeInterviewSub = this.interviewService.changeStatus(interview.id, 'COMPLETED').subscribe(() => {
      this.notificationService.sendSuccessMsg('applicationManagement.interviewCompleteSuccess');
      this.fetchInterviews();
    });
  }

  cancelInterview(interview: Interview): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.cancelInterviewSub = this.interviewService.changeStatus(interview.id, 'CANCELLED').subscribe(() => {
        this.notificationService.sendSuccessMsg('applicationManagement.interviewCancelSuccess');
        this.fetchInterviews();
      });
    });
  }

  // --- Offers ---

  fetchOffers(): void {
    this.subscribers.offersSub = this.offerService.findByApplication(this.applicationId).subscribe(response => {
      this.offers = response?.list || [];
    });
  }

  openCreateOffer(): void {
    this.offerForm.reset({ position: this.application.jobTitle });
    this.offerDialogVisible = true;
  }

  createOffer(): void {
    this.savingOffer = true;
    this.subscribers.createOfferSub = this.offerService.createOffer({
      applicationId: this.applicationId,
      ...this.offerForm.value
    }).subscribe({
      next: () => {
        this.savingOffer = false;
        this.offerDialogVisible = false;
        this.notificationService.sendSuccessMsg('applicationManagement.offerCreateSuccess');
        this.fetchOffers();
        this.fetchApplication();
        this.fetchHistory();
      },
      error: () => { this.savingOffer = false; }
    });
  }

  generateLetter(offer: Offer): void {
    this.subscribers.generateLetterSub = this.offerService.generateLetter(offer.id).subscribe(() => {
      this.notificationService.sendSuccessMsg('applicationManagement.offerLetterGenerated');
      this.fetchOffers();
    });
  }

  sendOffer(offer: Offer): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.sendOfferSub = this.offerService.send(offer.id).subscribe(() => {
        this.notificationService.sendSuccessMsg('applicationManagement.offerSentSuccess');
        this.fetchOffers();
      });
    });
  }

  downloadOfferLetter(offer: Offer): void {
    this.subscribers.downloadLetterSub = this.offerService.downloadLetter(offer.id).subscribe(blob => {
      triggerDownload(blob, `Offer-Letter-${offer.id}.pdf`);
    });
  }

  // --- Onboarding ---

  fetchOnboardingTasks(): void {
    this.subscribers.onboardingSub = this.onboardingTaskService.findByApplication(this.applicationId).subscribe({
      next: (response) => { this.onboardingTasks = response?.list || []; },
      error: () => { this.onboardingTasks = []; }
    });
  }

  openAddTask(): void {
    this.taskForm.reset();
    this.taskDialogVisible = true;
  }

  addTask(): void {
    this.savingTask = true;
    this.subscribers.addTaskSub = this.onboardingTaskService.addTask({
      applicationId: this.applicationId,
      ...this.taskForm.value
    }).subscribe({
      next: () => {
        this.savingTask = false;
        this.taskDialogVisible = false;
        this.notificationService.sendSuccessMsg('applicationManagement.taskAddSuccess');
        this.fetchOnboardingTasks();
      },
      error: () => { this.savingTask = false; }
    });
  }

  completeTask(task: OnboardingTask): void {
    this.subscribers.completeTaskSub = this.onboardingTaskService.complete(task.id).subscribe(() => {
      this.notificationService.sendSuccessMsg('candidateApplication.taskCompleteSuccess');
      this.fetchOnboardingTasks();
    });
  }

  removeTask(task: OnboardingTask): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.removeTaskSub = this.onboardingTaskService.remove(task.id).subscribe(() => {
        this.notificationService.sendSuccessMsg('applicationManagement.taskRemoveSuccess');
        this.fetchOnboardingTasks();
      });
    });
  }

  // --- MCQ Tests ---

  fetchMcqAssignments(): void {
    this.subscribers.mcqAssignmentsSub = this.mcqTestAssignmentService.findByApplication(this.applicationId).subscribe(response => {
      this.mcqAssignments = response?.list || [];
    });
  }

  openAssignTest(): void {
    this.assignTestForm.reset();
    this.subscribers.activeTestsSub = this.mcqTestService
      .searchTests(new Map<any, any>().set('status', 'ACTIVE').set('isPageable', false))
      .subscribe(response => {
        const tests: McqTest[] = response?.list || [];
        this.activeTestOptions = tests.map(t => ({ label: t.name, value: t.id }));
      });
    this.assignTestDialogVisible = true;
  }

  assignTest(): void {
    if (this.isFormInvalid(this.assignTestForm)) { return; }
    const raw = this.assignTestForm.getRawValue();
    if (raw.scheduledAt && raw.scheduledEndAt && new Date(raw.scheduledEndAt) <= new Date(raw.scheduledAt)) {
      this.notificationService.sendErrorMsg('mcqTest.endBeforeStartError');
      return;
    }
    this.assigningTest = true;
    this.subscribers.assignTestSub = this.mcqTestAssignmentService.assign({
      applicationId: this.applicationId,
      mcqTestId: raw.mcqTestId,
      scheduledAt: raw.scheduledAt,
      scheduledEndAt: raw.scheduledEndAt
    }).subscribe({
      next: () => {
        this.assigningTest = false;
        this.assignTestDialogVisible = false;
        this.notificationService.sendSuccessMsg('applicationManagement.mcqTestAssignSuccess');
        this.fetchMcqAssignments();
        this.fetchHistory();
      },
      error: () => { this.assigningTest = false; }
    });
  }

  viewMcqBreakdown(assignment: McqTestAssignment): void {
    this.subscribers.mcqBreakdownSub = this.mcqTestAssignmentService.getQuestions(assignment.id).subscribe(response => {
      this.reviewQuestions = response?.list || [];
      this.reviewDialogVisible = true;
    });
  }
}
