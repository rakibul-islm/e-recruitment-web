import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base.component';
import { SessionService } from '../../../services/session/session.service';
import { GuestSession, SessionSummary, UserSession } from '../../../services/session/domain/session.domain';

@Component({
  selector: 'app-session-presence-cards',
  templateUrl: './session.presence.cards.component.html'
})
export class SessionPresenceCardsComponent extends BaseComponent implements OnInit {
  summary: SessionSummary = new SessionSummary();

  detailVisible = false;
  detailMode: 'sessions' | 'users' | 'guests' = 'sessions';
  detailLoading = false;
  activeSessions: UserSession[] = [];
  onlineUsers: UserSession[] = [];
  guests: GuestSession[] = [];

  constructor(private sessionService: SessionService) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.summarySub = this.sessionService.getSummary().subscribe(response => {
      this.summary = response?.obj || new SessionSummary();
    });
    this.subscribers.summaryStreamSub = this.sessionService.streamSummary().subscribe(summary => {
      const changed = this.hasCountChanged(summary);
      this.summary = summary;
      if (this.detailVisible && changed) { this.fetchDetail(); }
    });
  }

  openDetail(mode: 'sessions' | 'users' | 'guests'): void {
    this.detailMode = mode;
    this.detailVisible = true;
    this.fetchDetail();
  }

  private fetchDetail(): void {
    this.detailLoading = true;
    if (this.detailMode === 'guests') {
      this.subscribers.guestsSub = this.sessionService.getActiveGuests().subscribe({
        next: (response) => { this.guests = response?.list || []; this.detailLoading = false; },
        error: () => { this.detailLoading = false; }
      });
      return;
    }
    if (this.detailMode === 'users') {
      this.subscribers.onlineUsersSub = this.sessionService.getOnlineUsers().subscribe({
        next: (response) => { this.onlineUsers = response?.list || []; this.detailLoading = false; },
        error: () => { this.detailLoading = false; }
      });
      return;
    }
    this.subscribers.activeSessionsSub = this.sessionService.getActiveUsers().subscribe({
      next: (response) => { this.activeSessions = response?.list || []; this.detailLoading = false; },
      error: () => { this.detailLoading = false; }
    });
  }

  private hasCountChanged(next: SessionSummary): boolean {
    return next.activeSessions !== this.summary.activeSessions
      || next.distinctActiveUsers !== this.summary.distinctActiveUsers
      || next.activeGuests !== this.summary.activeGuests;
  }
}
