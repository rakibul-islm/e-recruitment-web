import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { McqTestService } from '../../../services/mcq-test/mcq.test.service';
import { McqQuestionService } from '../../../services/mcq-question/mcq.question.service';
import { McqTest, McqTestRequest } from '../../../services/mcq-test/domain/mcq.test.domain';
import { McqQuestion } from '../../../services/mcq-question/domain/mcq.question.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-mcq-test-form',
  templateUrl: './mcq.test.form.component.html'
})
export class McqTestFormComponent extends BaseComponent implements OnInit {
  testForm!: FormGroup;
  testId?: number;
  questionOptions: { label: string; value: number }[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private mcqTestService: McqTestService,
    private mcqQuestionService: McqQuestionService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchApprovedQuestions();
    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.testId = Number(paramMap.get('id')) || undefined;
      this.testId ? this.fetchTest(this.testId) : this.prepareForm();
    });
  }

  fetchApprovedQuestions(): void {
    this.subscribers.questionOptionsSub = this.mcqQuestionService
      .searchQuestions(new Map<any, any>().set('status', 'APPROVED').set('isPageable', false))
      .subscribe(response => {
        const questions: McqQuestion[] = response?.list || [];
        this.questionOptions = questions.map(q => ({ label: q.questionText, value: q.id }));
      });
  }

  fetchTest(id: number): void {
    this.subscribers.findTestSub = this.mcqTestService.findTestById(id).subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  prepareForm(formData?: McqTest): void {
    formData = formData || new McqTest();

    this.testForm = this.formBuilder.group({
      name: [formData.name, Validators.required],
      description: [formData.description],
      durationMinutes: [formData.durationMinutes || 30, [Validators.required, Validators.min(1)]],
      passingScorePercent: [formData.passingScorePercent ?? 60, [Validators.required, Validators.min(0), Validators.max(100)]],
      questionSelectionCount: [formData.questionSelectionCount],
      secondsPerQuestion: [formData.secondsPerQuestion, [Validators.min(5)]],
      shuffleQuestions: [formData.shuffleQuestions || false],
      shuffleOptions: [formData.shuffleOptions || false],
      status: [formData.status || 'DRAFT'],
      questionIds: [formData.questionIds || []]
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.testForm)) { return; }
    const raw = this.testForm.getRawValue();
    if (!raw.questionIds || !raw.questionIds.length) {
      this.notificationService.sendErrorMsg('mcqTest.questionsRequired');
      return;
    }
    if (raw.questionSelectionCount && raw.questionSelectionCount > raw.questionIds.length) {
      this.notificationService.sendErrorMsg('mcqTest.selectionCountTooHigh');
      return;
    }

    const payload: McqTestRequest = raw;

    this.commonConfirmDialogService.confirm(() => {
      this.testId ? this.updateTest({ ...payload, id: this.testId }) : this.createTest(payload);
    });
  }

  createTest(payload: McqTestRequest): void {
    this.subscribers.createTestSub = this.mcqTestService.createTest(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('mcqTest.createSuccess');
      this.navigateToSearch();
    });
  }

  updateTest(payload: McqTestRequest): void {
    this.subscribers.updateTestSub = this.mcqTestService.updateTest(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('mcqTest.updateSuccess');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/mcq-tests']);
  }
}
