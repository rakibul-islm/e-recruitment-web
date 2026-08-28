import { Directive, Input, OnChanges, OnDestroy, OnInit, Self } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Dropdown } from 'primeng/dropdown';

// Matches only optionLabel="label" dropdowns, so domain-object dropdowns (e.g. optionLabel="name") stay untouched.
@Directive({
  selector: 'p-dropdown[optionLabel="label"]'
})
export class TranslateOptionsDirective implements OnInit, OnChanges, OnDestroy {
  @Input() options: { label: string; value: unknown }[] = [];

  private subscription?: Subscription;

  constructor(@Self() private dropdown: Dropdown, private translate: TranslateService) {}

  ngOnInit(): void {
    this.subscription = this.translate.onLangChange.subscribe(() => this.applyTranslations());
  }

  ngOnChanges(): void {
    this.applyTranslations();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // translate.instant() returns the input unchanged when it isn't a known key, so labels that aren't i18n keys pass through untouched.
  private applyTranslations(): void {
    this.dropdown.options = (this.options || []).map(option => ({
      ...option,
      label: this.translate.instant(option.label)
    }));
  }
}
