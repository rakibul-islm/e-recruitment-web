import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown.timer.component.html',
  styleUrls: ['./countdown.timer.component.scss']
})
export class CountdownTimerComponent implements OnChanges, OnDestroy {
  @Input() deadlineAt?: Date | string;
  @Output() expired = new EventEmitter<void>();

  minutes = 0;
  seconds = 0;
  low = false;
  private intervalId: any;
  private emitted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deadlineAt']) {
      this.emitted = false;
      this.startTicking();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) { clearInterval(this.intervalId); }
  }

  private startTicking(): void {
    if (this.intervalId) { clearInterval(this.intervalId); }
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (!this.deadlineAt) { return; }
    const remainingMs = new Date(this.deadlineAt).getTime() - Date.now();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    this.minutes = Math.floor(remainingSeconds / 60);
    this.seconds = remainingSeconds % 60;
    this.low = remainingSeconds <= 60;

    if (remainingSeconds <= 0 && !this.emitted) {
      this.emitted = true;
      if (this.intervalId) { clearInterval(this.intervalId); }
      this.expired.emit();
    }
  }
}
