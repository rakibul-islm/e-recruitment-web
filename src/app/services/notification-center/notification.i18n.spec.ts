import en from '../../../assets/i18n/en.json';
import bn from '../../../assets/i18n/bn.json';
import { NOTIFICATION_TYPE_ICONS, TOAST_NOTIFICATION_TYPES } from './domain/notification.domain';

function leaves(node: any, prefix = ''): Record<string, string> {
  return Object.entries(node).reduce((result, [key, value]) => {
    if (value !== null && typeof value === 'object') {
      return { ...result, ...leaves(value, `${prefix}${key}.`) };
    }
    return { ...result, [`${prefix}${key}`]: String(value) };
  }, {} as Record<string, string>);
}

function placeholders(text: string): string[] {
  return (text.match(/\{\{\s*\w+\s*\}\}/g) || []).map(match => match.replace(/[{}\s]/g, '')).sort();
}

describe('notification i18n', () => {
  const enLeaves = leaves(en.notification);
  const bnLeaves = leaves(bn.notification);

  it('has the same keys in English and Bengali', () => {
    expect(Object.keys(bnLeaves).sort()).toEqual(Object.keys(enLeaves).sort());
  });

  it('uses the same interpolation placeholders in both languages for every key', () => {
    Object.keys(enLeaves).forEach(key => {
      expect(placeholders(bnLeaves[key])).withContext(key).toEqual(placeholders(enLeaves[key]));
    });
  });

  it('has a non-empty title and message for every notification type icon', () => {
    Object.keys(NOTIFICATION_TYPE_ICONS).forEach(type => {
      ['title', 'message'].forEach(part => {
        expect(enLeaves[`types.${type}.${part}`]).withContext(`en ${type}.${part}`).toBeTruthy();
        expect(bnLeaves[`types.${type}.${part}`]).withContext(`bn ${type}.${part}`).toBeTruthy();
      });
    });
  });

  it('only toasts notification types that exist', () => {
    TOAST_NOTIFICATION_TYPES.forEach(type => {
      expect(Object.keys(NOTIFICATION_TYPE_ICONS)).withContext(type).toContain(type);
    });
  });

  it('has a translated label for both filter options', () => {
    ['all', 'unread'].forEach(option => {
      expect(enLeaves[`filter.${option}`]).withContext(`en ${option}`).toBeTruthy();
      expect(bnLeaves[`filter.${option}`]).withContext(`bn ${option}`).toBeTruthy();
    });
  });

  it('has an icon for every translated notification type', () => {
    const translatedTypes = Object.keys(en.notification.types).sort();
    expect(Object.keys(NOTIFICATION_TYPE_ICONS).sort()).toEqual(translatedTypes);
  });
});
