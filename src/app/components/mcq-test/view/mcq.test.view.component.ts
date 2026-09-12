import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { McqTestService } from '../../../services/mcq-test/mcq.test.service';
import { McqQuestionService } from '../../../services/mcq-question/mcq.question.service';
import { McqTest } from '../../../services/mcq-test/domain/mcq.test.domain';
import { McqQuestion } from '../../../services/mcq-question/domain/mcq.question.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-mcq-test-view',
  templateUrl: './mcq.test.view.component.html'
})
export class McqTestViewComponent extends BaseComponent implements OnInit {
  test: McqTest = new McqTest();
  testId!: number;
  questions: McqQuestion[] = [];

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private mcqTestService: McqTestService,
    private mcqQuestionService: McqQuestionService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchTest();
  }

  fetchTest(): void {
    this.subscribers.findTestSub = this.mcqTestService.findTestById(this.testId).subscribe(response => {
      this.test = response?.obj;
      this.fetchQuestions();
    });
  }

  fetchQuestions(): void {
    if (!this.test.questionIds?.length) { this.questions = []; return; }
    this.subscribers.questionsSub = this.mcqQuestionService
      .searchQuestions(new Map<any, any>().set('id_in', this.test.questionIds.join(',')).set('isPageable', false))
      .subscribe(response => { this.questions = response?.list || []; });
  }

  changeStatus(status: string): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.updateStatusSub = this.mcqTestService.updateTest({ ...this.test, status }).subscribe(() => {
        this.notificationService.sendSuccessMsg('mcqTest.updateSuccess');
        this.fetchTest();
      });
    });
  }

  removeTest(): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.removeSub = this.mcqTestService.removeTest(this.testId).subscribe(() => {
        this.notificationService.sendSuccessMsg('mcqTest.removeSuccess');
        this.router.navigate(['/mcq-tests']);
      });
    });
  }
}
