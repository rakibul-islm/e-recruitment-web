import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppMenuItem } from './constants/app.menu.model';

export interface AppLanguage {
  code: string;
  label: string;
}

const SUPPORTED_LANGUAGES: AppLanguage[] = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' }
];
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private translate: TranslateService) {}

  init(): void {
    this.translate.addLangs(SUPPORTED_LANGUAGES.map(language => language.code));
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
    this.use(this.getCurrentLang());
  }

  use(lang: string): void {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    this.translate.use(lang);
  }

  getCurrentLang(): string {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE;
  }

  buildLanguageMenuItem(): AppMenuItem {
    const current = SUPPORTED_LANGUAGES.find(language => language.code === this.getCurrentLang());
    return {
      label: current?.label || SUPPORTED_LANGUAGES[0].label,
      icon: 'pi pi-globe',
      items: SUPPORTED_LANGUAGES.map(language => ({
        label: language.label,
        command: () => this.use(language.code)
      }))
    };
  }
}
