import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base.component';
import { SessionService } from '../../../services/session/session.service';
import { GuestSession, SessionSummary, UserSession } from '../../../services/session/domain/session.domain';

const DETAIL_PAGE_SIZE = 100;

@Component({
  selector: 'app-session-presence-cards',
  templateUrl: './session.presence.cards.component.html'
})
export class SessionPresenceCardsComponent extends BaseComponent implements OnInit {
  summary: SessionSummary = new SessionSummary();

  detailVisible = false;
  detailMode: 'sessions' | 'guests' = 'sessions';
  detailLoading = false;
  activeSessions: UserSession[] = [];
  guests: GuestSession[] = [];

  constructor(private sessionService: SessionService) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.summarySub = this.sessionService.getSummary().subscribe(response => {
      this.summary = response?.obj || new SessionSummary();
    });
    this.subscribers.summaryStreamSub = this.sessionService.streamSummary().subscribe(summary => {
      this.summary = summary;
      if (this.detailVisible) { this.fetchDetail(); }
    });
  }

  openDetail(mode: 'sessions' | 'guests'): void {
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
    const params = new Map<any, any>([['page', 0], ['size', DETAIL_PAGE_SIZE], ['isPageable', true], ['status', 'ACTIVE']]);
    this.subscribers.activeSessionsSub = this.sessionService.searchSessions(params).subscribe({
      next: (response) => { this.activeSessions = response?.page?.content || []; this.detailLoading = false; },
      error: () => { this.detailLoading = false; }
    });
  }
}
