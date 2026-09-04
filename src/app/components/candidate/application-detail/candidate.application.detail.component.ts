import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { ApplicationService } from '../../../services/application/application.service';
import { InterviewService } from '../../../services/interview/interview.service';
import { OfferService } from '../../../services/offer/offer.service';
import { OnboardingTaskService } from '../../../services/onboarding/onboarding.task.service';
import { Application } from '../../../services/application/domain/application.domain';
import { Interview } from '../../../services/interview/domain/interview.domain';
import { Offer } from '../../../services/offer/domain/offer.domain';
import { OnboardingTask } from '../../../services/onboarding/domain/onboarding.task.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { triggerDownload } from '../../../services/utility/file-download.util';

@Component({
  selector: 'app-candidate-application-detail',
  templateUrl: './candidate.application.detail.component.html'
})
export class CandidateApplicationDetailComponent extends BaseComponent implements OnInit {
  application: Application = new Application();
  applicationId!: number;
  interviews: Interview[] = [];
  offers: Offer[] = [];
  onboardingTasks: OnboardingTask[] = [];

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private offerService: OfferService,
    private onboardingTaskService: OnboardingTaskService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchApplication();
    this.fetchInterviews();
    this.fetchOffers();
    this.fetchOnboardingTasks();
  }

  fetchApplication(): void {
    this.subscribers.findApplicationSub = this.applicationService.findApplicationById(this.applicationId).subscribe(response => {
      this.application = response?.obj;
    });
  }

  fetchInterviews(): void {
    this.subscribers.interviewsSub = this.interviewService.findByApplication(this.applicationId).subscribe(response => {
      this.interviews = response?.list || [];
    });
  }

  fetchOffers(): void {
    this.subscribers.offersSub = this.offerService.findByApplication(this.applicationId).subscribe(response => {
      this.offers = response?.list || [];
    });
  }

  fetchOnboardingTasks(): void {
    this.subscribers.onboardingSub = this.onboardingTaskService.findByApplication(this.applicationId).subscribe({
      next: (response) => { this.onboardingTasks = response?.list || []; },
      error: () => { this.onboardingTasks = []; }
    });
  }

  respondToOffer(offer: Offer, accept: boolean): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.respondSub = this.offerService.respond(offer.id, accept).subscribe(() => {
        this.notificationService.sendSuccessMsg(accept ? 'candidateApplication.offerAccepted' : 'candidateApplication.offerDeclined');
        this.fetchOffers();
        this.fetchApplication();
        this.fetchOnboardingTasks();
      });
    });
  }

  downloadOfferLetter(offer: Offer): void {
    this.subscribers.downloadLetterSub = this.offerService.downloadLetter(offer.id).subscribe(blob => {
      triggerDownload(blob, `Offer-Letter-${offer.id}.pdf`);
    });
  }

  completeTask(task: OnboardingTask): void {
    this.subscribers.completeTaskSub = this.onboardingTaskService.complete(task.id).subscribe(() => {
      this.notificationService.sendSuccessMsg('candidateApplication.taskCompleteSuccess');
      this.fetchOnboardingTasks();
    });
  }
}
