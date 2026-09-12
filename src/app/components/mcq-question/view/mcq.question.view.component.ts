import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { McqQuestionService } from '../../../services/mcq-question/mcq.question.service';
import { McqQuestion } from '../../../services/mcq-question/domain/mcq.question.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-mcq-question-view',
  templateUrl: './mcq.question.view.component.html'
})
export class McqQuestionViewComponent extends BaseComponent implements OnInit {
  question: McqQuestion = new McqQuestion();
  questionId!: number;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private mcqQuestionService: McqQuestionService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.questionId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchQuestion();
  }

  fetchQuestion(): void {
    this.subscribers.findQuestionSub = this.mcqQuestionService.findQuestionById(this.questionId).subscribe(response => {
      this.question = response?.obj;
    });
  }

  approve(): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.approveSub = this.mcqQuestionService.updateQuestion({ ...this.question, status: 'APPROVED' })
        .subscribe(() => {
          this.notificationService.sendSuccessMsg('mcqQuestion.approveSuccess');
          this.fetchQuestion();
        });
    });
  }

  removeQuestion(): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.removeSub = this.mcqQuestionService.removeQuestion(this.questionId).subscribe(() => {
        this.notificationService.sendSuccessMsg('mcqQuestion.removeSuccess');
        this.router.navigate(['/mcq-questions']);
      });
    });
  }
}
