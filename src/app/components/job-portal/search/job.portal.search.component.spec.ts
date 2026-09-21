import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { JobPortalSearchComponent } from './job.portal.search.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { JobPosting } from '../../../services/job-posting/domain/job.posting.domain';
import { SavedJobService } from '../../../services/saved-job/saved.job.service';
import { AuthService } from '../../../services/utility/security/auth.service';
import { NotificationService } from '../../../services/utility/notification.service';

function job(id: number, overrides: Partial<JobPosting> = {}): JobPosting {
  return {
    id,
    jobTitle: 'Senior Java Developer',
    companyName: 'Acme Ltd',
    jobLocation: 'Dhaka',
    skills: 'Java,Spring Boot,SQL',
    employmentStatus: 'Full-time',
    applicationDeadLine: '2030-06-30',
    ...overrides
  } as unknown as JobPosting;
}

const UNEVEN_JOBS: JobPosting[] = [
  job(1),
  job(2, { jobTitle: 'QA', companyName: 'Tiny Co', jobLocation: '', skills: '', employmentStatus: '' }),
  job(3, { jobTitle: 'Principal Distributed Systems Engineer for the Global Payments Platform and Reconciliation Services',
    companyName: 'Bangladesh International Financial Technology Holdings Limited', jobLocation: 'Chattogram Export Processing Zone, Bangladesh', skills: 'Go' }),
  job(4, { jobTitle: 'Support Engineer', skills: 'Linux', employmentStatus: '' }),
  job(5, { jobTitle: 'Product Designer', skills: 'Figma,Sketch,Prototyping,User Research,Accessibility,Design Systems' }),
  job(6, { jobTitle: 'Data Analyst', skills: '', employmentStatus: 'Part-time' }),
  job(7, { jobTitle: 'Frontend Engineer', skills: 'Angular,TypeScript', employmentStatus: 'Internship' })
];

describe('JobPortalSearchComponent card layout', () => {
  let fixture: ComponentFixture<JobPortalSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobPortalSearchComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), CardModule, ButtonModule],
      providers: [
        { provide: JobPostingService, useValue: { searchJobPostings: () => of({ page: { content: UNEVEN_JOBS, totalElements: UNEVEN_JOBS.length } }) } },
        { provide: SavedJobService, useValue: { myList: () => of({ list: [] }) } },
        { provide: AuthService, useValue: { isLoggedIn: () => of(false) } },
        { provide: NotificationService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(JobPortalSearchComponent);
    fixture.detectChanges();
  });

  function cards(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.job-card-col .p-card'));
  }

  function rect(card: HTMLElement, selector: string): DOMRect {
    return (card.querySelector(selector) as HTMLElement).getBoundingClientRect();
  }

  it('renders one card per job', () => {
    expect(cards().length).toBe(UNEVEN_JOBS.length);
  });

  it('makes every card the same height, however uneven the content is', () => {
    const heights = cards().map(card => Math.round(card.getBoundingClientRect().height));

    expect(new Set(heights).size).withContext(`heights: ${heights.join(', ')}`).toBe(1);
  });

  it('pins every footer to the bottom of its card', () => {
    const gaps = cards().map(card => Math.round(card.getBoundingClientRect().bottom - rect(card, '.job-card-footer').bottom));

    expect(new Set(gaps).size).withContext(`gaps: ${gaps.join(', ')}`).toBe(1);
  });

  it('gives every footer the same height, with or without an employment type', () => {
    const heights = cards().map(card => Math.round(rect(card, '.job-card-footer').height * 10));

    expect(new Set(heights).size).withContext(`footer heights: ${heights.join(', ')}`).toBe(1);
  });

  it('keeps the deadline right-aligned on every card, even when there is no employment type', () => {
    const distances = cards().map(card => Math.round(rect(card, '.p-card-body').right - rect(card, '.job-card-deadline').right));

    expect(new Set(distances).size).withContext(`distances: ${distances.join(', ')}`).toBe(1);
  });

  it('lets a very long title wrap inside its card instead of overflowing it', () => {
    cards().forEach(card => {
      expect(rect(card, '.job-card-title').right).toBeLessThanOrEqual(card.getBoundingClientRect().right);
      expect(rect(card, '.job-card-company').right).toBeLessThanOrEqual(card.getBoundingClientRect().right);
    });
  });
});
