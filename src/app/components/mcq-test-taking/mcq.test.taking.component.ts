import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { McqTestAssignmentService } from '../../services/mcq-test-assignment/mcq.test.assignment.service';
import { McqAttemptQuestion, McqTestAssignment } from '../../services/mcq-test-assignment/domain/mcq.test.assignment.domain';
import { CommonConfirmDialogService } from '../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-mcq-test-taking',
  templateUrl: './mcq.test.taking.component.html',
  styleUrls: ['./mcq.test.taking.component.scss']
})
export class McqTestTakingComponent extends BaseComponent implements OnInit, OnDestroy {
  assignmentId!: number;
  assignment: McqTestAssignment = new McqTestAssignment();
  questions: McqAttemptQuestion[] = [];
  loadingTest = true;
  submitting = false;
  advancing = false;
  // Forward-only, one question at a time for exam integrity - mirrors assignment.currentQuestionIndex
  // (the real, server-enforced position; see advance()/beginAttempt()) so a page reload restores
  // the candidate exactly where they left off instead of resetting to question 1. There is
  // deliberately no way to decrement this or re-render an earlier question once advanced past it.
  currentIndex = 0;
  startError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mcqTestAssignmentService: McqTestAssignmentService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.assignmentId = Number(this.route.snapshot.paramMap.get('assignmentId'));
    this.beginAttempt();
  }

  override ngOnDestroy(): void {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    super.ngOnDestroy();
  }

  // Best-effort only: browsers require a live user gesture to grant fullscreen, and by the time
  // the assignment/questions requests resolve here that gesture may already have expired (most
  // browsers allow a short window after the click that navigated to this page), so this can
  // silently no-op on some browsers/navigations. There is no reliable way around that restriction.
  private requestFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  beginAttempt(): void {
    this.subscribers.startSub = this.mcqTestAssignmentService.start(this.assignmentId).subscribe({
      next: (response) => {
        this.assignment = response?.obj;
        this.currentIndex = this.assignment.currentQuestionIndex || 0;
        if (this.assignment.status === 'SUBMITTED' || this.assignment.status === 'EXPIRED') {
          this.loadingTest = false;
          return;
        }
        this.fetchQuestions();
      },
      error: (error) => {
        this.loadingTest = false;
        this.startError = error?.error?.message || null;
      }
    });
  }

  fetchQuestions(): void {
    this.subscribers.questionsSub = this.mcqTestAssignmentService.getQuestions(this.assignmentId).subscribe({
      next: (response) => {
        this.questions = response?.list || [];
        this.loadingTest = false;
        this.requestFullscreen();
      },
      error: () => { this.loadingTest = false; }
    });
  }

  selectAnswer(question: McqAttemptQuestion, optionKey: string): void {
    question.selectedOptionKey = optionKey;
    this.subscribers.answerSub = this.mcqTestAssignmentService
      .saveAnswer(this.assignmentId, { assignmentQuestionId: question.id, selectedOptionKey: optionKey })
      .subscribe();
  }

  get currentQuestion(): McqAttemptQuestion | undefined {
    return this.questions[this.currentIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentIndex >= this.questions.length - 1;
  }

  // Per-question pacing is optional (McqTest.secondsPerQuestion) - when the assignment carries a
  // snapshot of it, the countdown binds to the server-stamped currentQuestionDeadlineAt (reset on
  // every advance) instead of the whole-attempt deadlineAt, so each question gets its own window.
  get activeDeadlineAt(): Date | string | undefined {
    return this.assignment.secondsPerQuestionSnapshot ? this.assignment.currentQuestionDeadlineAt : this.assignment.deadlineAt;
  }

  // A per-question timer hitting zero should just move on (not end the whole attempt) unless this
  // is the last question, in which case there's nowhere left to advance to.
  onTimerExpired(): void {
    if (this.assignment.secondsPerQuestionSnapshot && !this.isLastQuestion) {
      this.next();
    } else {
      this.submit();
    }
  }

  // The only way to move through the test - there is no matching "previous" method, and nothing
  // in the template can decrement currentIndex, by design (see the class comment on currentIndex).
  // Goes through the server (not just a local currentIndex++) so the new position - and, when
  // per-question pacing is on, the fresh currentQuestionDeadlineAt - is persisted and reflected;
  // otherwise a reload right after clicking Next would still land back on the question just left.
  next(): void {
    if (this.isLastQuestion || this.advancing) { return; }
    this.advancing = true;
    this.subscribers.advanceSub = this.mcqTestAssignmentService.advance(this.assignmentId).subscribe({
      next: (response) => {
        this.advancing = false;
        if (response?.obj) { this.assignment = response.obj; }
        this.currentIndex = response?.obj?.currentQuestionIndex ?? this.currentIndex + 1;
      },
      error: () => { this.advancing = false; }
    });
  }

  confirmSubmit(): void {
    this.commonConfirmDialogService.confirm(() => this.submit(), null, 'mcqTestTaking.submitConfirm');
  }

  // Called both by the manual submit button and by the countdown hitting zero - the backend
  // grades whatever was saved either way, so a time-expiry submit needs no separate handling here.
  submit(): void {
    if (this.submitting || this.assignment.status === 'SUBMITTED') { return; }
    this.submitting = true;
    this.subscribers.submitSub = this.mcqTestAssignmentService.submit(this.assignmentId).subscribe({
      next: (response) => {
        this.submitting = false;
        this.assignment = response?.obj;
        this.notificationService.sendSuccessMsg('mcqTestTaking.submitSuccess');
      },
      error: () => { this.submitting = false; }
    });
  }

  backToApplication(): void {
    this.router.navigate(['/my/applications', this.assignment.applicationId]);
  }
}
