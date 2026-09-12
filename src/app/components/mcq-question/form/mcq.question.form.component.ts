import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { McqQuestionService } from '../../../services/mcq-question/mcq.question.service';
import { McqQuestion, McqQuestionRequest, MCQ_DIFFICULTY_OPTIONS } from '../../../services/mcq-question/domain/mcq.question.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-mcq-question-form',
  templateUrl: './mcq.question.form.component.html'
})
export class McqQuestionFormComponent extends BaseComponent implements OnInit {
  questionForm!: FormGroup;
  questionId?: number;
  difficultyOptions = MCQ_DIFFICULTY_OPTIONS;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private mcqQuestionService: McqQuestionService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.questionId = Number(paramMap.get('id')) || undefined;
      this.questionId ? this.fetchQuestion(this.questionId) : this.prepareForm();
    });
  }

  fetchQuestion(id: number): void {
    this.subscribers.findQuestionSub = this.mcqQuestionService.findQuestionById(id).subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  prepareForm(formData?: McqQuestion): void {
    formData = formData || new McqQuestion();

    this.questionForm = this.formBuilder.group({
      questionText: [formData.questionText, Validators.required],
      skillTag: [formData.skillTag],
      difficulty: [formData.difficulty || 'MEDIUM', Validators.required],
      explanation: [formData.explanation],
      status: [formData.status || 'APPROVED'],
      options: this.formBuilder.array(
        (formData.options && formData.options.length ? formData.options : [{ optionText: '', correct: true }, { optionText: '', correct: false }])
          .map(item => this.buildOptionGroup(item))
      )
    });
  }

  get options(): FormArray { return this.questionForm.get('options') as FormArray; }

  buildOptionGroup(item: any = {}): FormGroup {
    return this.formBuilder.group({
      optionKey: [item.optionKey],
      optionText: [item.optionText, Validators.required],
      correct: [item.correct || false]
    });
  }

  addOption(): void {
    this.options.push(this.buildOptionGroup());
  }

  removeAt(index: number): void {
    this.options.removeAt(index);
  }

  // Only one option may be marked correct - selecting one clears the rest, so the underlying
  // control set always represents "exactly one correct" without needing a custom validator.
  markCorrect(index: number): void {
    this.options.controls.forEach((group, i) => group.get('correct')!.setValue(i === index));
  }

  submit(): void {
    if (this.isFormInvalid(this.questionForm)) { return; }
    if (this.options.length < 2) {
      this.notificationService.sendErrorMsg('mcqQuestion.minOptionsError');
      return;
    }
    if (!this.options.value.some((o: any) => o.correct)) {
      this.notificationService.sendErrorMsg('mcqQuestion.correctOptionRequired');
      return;
    }

    const payload: McqQuestionRequest = this.questionForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => {
      this.questionId ? this.updateQuestion({ ...payload, id: this.questionId }) : this.createQuestion(payload);
    });
  }

  createQuestion(payload: McqQuestionRequest): void {
    this.subscribers.createQuestionSub = this.mcqQuestionService.createQuestion(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('mcqQuestion.createSuccess');
      this.navigateToSearch();
    });
  }

  updateQuestion(payload: McqQuestionRequest): void {
    this.subscribers.updateQuestionSub = this.mcqQuestionService.updateQuestion(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('mcqQuestion.updateSuccess');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/mcq-questions']);
  }
}
