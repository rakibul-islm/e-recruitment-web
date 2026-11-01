import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-legal-page',
  templateUrl: './legal.page.component.html',
  styleUrls: ['./legal.page.component.scss']
})
export class LegalPageComponent implements OnInit {
  readonly type: 'terms' | 'privacy';
  compact = false;
  headerHeight = 56;

  constructor(route: ActivatedRoute) {
    this.type = route.snapshot.data['legalType'] === 'privacy' ? 'privacy' : 'terms';
  }

  ngOnInit(): void {
    this.measure();
  }

  get baseKey(): string {
    return 'app.legal.' + this.type;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.compact = window.scrollY > 160;
  }

  @HostListener('window:resize')
  measure(): void {
    const header = document.querySelector('app-header') as HTMLElement | null;
    if (header) {
      this.headerHeight = header.offsetHeight;
    }
  }

  stripNumber(title: string): string {
    return title.replace(/^\d+\.\s*/, '');
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
