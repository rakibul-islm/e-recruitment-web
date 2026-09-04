import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { SessionService } from '../../../services/session/session.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { UserSession } from '../../../services/session/domain/session.domain';

@Component({
  selector: 'app-session-view',
  templateUrl: './session.view.component.html'
})
export class SessionViewComponent extends BaseComponent implements OnInit {
  session: UserSession = new UserSession();
  userSessions: UserSession[] = [];
  sessionId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchSession();
  }

  fetchSession(): void {
    this.subscribers.findSessionSub = this.sessionService.findSessionById(this.sessionId).subscribe(response => {
      this.session = response?.obj;
      if (this.session?.userId) this.fetchUserSessions(this.session.userId);
    });
  }

  fetchUserSessions(userId: number): void {
    this.subscribers.findUserSessionsSub = this.sessionService.findSessionsByUser(userId).subscribe(response => {
      this.userSessions = response?.list || [];
    });
  }

  isSessionActive(session: UserSession): boolean {
    return !session.revoked && new Date(session.expiresAt) > new Date();
  }

  forceLogout(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.forceLogoutSub = this.sessionService.forceLogoutSession(this.sessionId).subscribe(() => {
          this.notificationService.sendSuccessMsg('session.forceLogoutSuccess');
          this.fetchSession();
        });
      },
      null,
      'session.forceLogoutConfirm', { name: this.session.userFullName || this.session.userEmail }
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/sessions']);
  }
}
