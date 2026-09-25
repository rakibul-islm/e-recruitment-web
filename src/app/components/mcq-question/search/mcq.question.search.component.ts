import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { McqQuestionService } from '../../../services/mcq-question/mcq.question.service';
import { McqQuestion, MCQ_DIFFICULTY_OPTIONS, MCQ_QUESTION_STATUS_OPTIONS } from '../../../services/mcq-question/domain/mcq.question.domain';

@Component({
  selector: 'app-mcq-question-search',
  templateUrl: './mcq.question.search.component.html'
})
export class McqQuestionSearchComponent extends BaseComponent implements OnInit {
  questions: McqQuestion[] = [];
  selectedQuestion: McqQuestion | null = null;
  difficultyOptions = [{ label: 'common.all', value: '' }, ...MCQ_DIFFICULTY_OPTIONS];
  statusOptions = [{ label: 'common.all', value: '' }, ...MCQ_QUESTION_STATUS_OPTIONS];

  filterForm!: FormGroup;

  generateDialogVisible = false;
  generateForm!: FormGroup;
  generating = false;
  difficultyOptionsPlain = MCQ_DIFFICULTY_OPTIONS;

  constructor(
    private formBuilder: FormBuilder,
    private mcqQuestionService: McqQuestionService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('mcq-question-search-filters', this.filterForm);
    this.generateForm = this.formBuilder.group({ skillTag: ['', Validators.required], difficulty: [null], count: [5] });
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      questionText_like: [''],
      skillTag_like: [''],
      difficulty: [''],
      status: ['']
    });
  }

  fetchQuestions(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchQuestionsSub = this.mcqQuestionService.searchQuestions(params).subscribe({
      next: (response) => {
        this.questions = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
        this.activeTabIndex = 1;
      },
      error: () => { this.loading = false; }
    });
  }

  search(table: Table): void {
    table.first = 0;
    this.fetchQuestions({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createQuestion(): void {
    this.clearFilters();
    this.router.navigate(['/mcq-questions/create']);
  }

  viewQuestion(question: McqQuestion): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/mcq-questions', question.id]);
  }

  openGenerateDialog(): void {
    this.generateForm.reset({ count: 5 });
    this.generateDialogVisible = true;
  }

  generate(table: Table): void {
    if (this.isFormInvalid(this.generateForm, 'mcqQuestion.skillTagRequired')) { return; }
    this.generating = true;
    this.subscribers.generateSub = this.mcqQuestionService.generate(this.generateForm.getRawValue()).subscribe({
      next: () => {
        this.generating = false;
        this.generateDialogVisible = false;
        this.notificationService.sendSuccessMsg('mcqQuestion.generateSuccess');
        this.filterForm.patchValue({ status: 'DRAFT' });
        this.search(table);
      },
      error: () => { this.generating = false; }
    });
  }
}
