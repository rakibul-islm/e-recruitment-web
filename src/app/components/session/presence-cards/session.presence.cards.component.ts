import { Component, OnInit } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { UserService } from '../../../services/user/user.service';
import { SessionService } from '../../../services/session/session.service';
import { GuestSession, SessionSummary, UserSession } from '../../../services/session/domain/session.domain';

@Component({
  selector: 'app-session-presence-cards',
  templateUrl: './session.presence.cards.component.html'
})
export class SessionPresenceCardsComponent extends BaseComponent implements OnInit {
  summary: SessionSummary = new SessionSummary();

  detailVisible = false;
  detailMode: 'sessions' | 'users' | 'guests' | 'total' = 'sessions';
  detailLoading = false;
  activeSessions: UserSession[] = [];
  onlineUsers: UserSession[] = [];
  guests: GuestSession[] = [];
  allUsers: any[] = [];
  totalUsersCount = 0;

  constructor(private sessionService: SessionService, private userService: UserService) {
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

  openDetail(mode: 'sessions' | 'users' | 'guests' | 'total'): void {
    this.detailMode = mode;
    this.detailVisible = true;
    this.fetchDetail();
  }

  fetchAllUsers(event: TableLazyLoadEvent): void {
    const size = event.rows || this.rows;
    const params = new Map<any, any>([['page', Math.floor((event.first || 0) / size)], ['size', size], ['isPageable', true]]);
    this.detailLoading = true;
    this.subscribers.allUsersSub = this.userService.searchUsers(params).subscribe({
      next: (response) => {
        this.allUsers = response?.page?.content || [];
        this.totalUsersCount = response?.page?.totalElements || 0;
        this.detailLoading = false;
      },
      error: () => { this.detailLoading = false; }
    });
  }

  private fetchDetail(): void {
    if (this.detailMode === 'total') { return; }
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
