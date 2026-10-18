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
  topicGroups: { key: string; label: string; items: { label: string; value: number }[] }[] = [];

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
        this.topicGroups = this.groupByTopic(questions);
      });
  }

  private groupByTopic(questions: McqQuestion[]): { key: string; label: string; items: { label: string; value: number }[] }[] {
    const groups = new Map<string, { key: string; label: string; items: { label: string; value: number }[] }>();
    questions.forEach(q => {
      const label = (q.skillTag || '').trim();
      const key = label.toLowerCase();
      if (!groups.has(key)) { groups.set(key, { key, label, items: [] }); }
      groups.get(key)!.items.push({ label: q.questionText, value: q.id });
    });
    return Array.from(groups.values()).sort((a, b) => (a.label ? 0 : 1) - (b.label ? 0 : 1) || a.label.localeCompare(b.label));
  }

  selectedInTopic(group: { items: { value: number }[] }): number {
    const selected: number[] = this.testForm?.get('questionIds')?.value || [];
    return group.items.filter(item => selected.includes(item.value)).length;
  }

  toggleTopic(group: { items: { value: number }[] }): void {
    const control = this.testForm.get('questionIds')!;
    const selected: number[] = control.value || [];
    const topicIds = group.items.map(item => item.value);
    const allSelected = this.selectedInTopic(group) === topicIds.length;
    control.setValue(allSelected ? selected.filter(id => !topicIds.includes(id)) : [...new Set([...selected, ...topicIds])]);
    control.markAsDirty();
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
