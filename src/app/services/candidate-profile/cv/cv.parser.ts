import { splitGridBlocks, tableize } from './cv.layout';
import { repairSkillTerm, skillTermsIn } from './cv.skills';
import {
  BULLET_REGEX, CvBlock, DATE_PART, DEGREE_CANON, EMAIL_REGEX, FIELDS, INSTITUTION_REGEX, JOB_TITLE_REGEX, LANGUAGE_ALIASES, LOCATION_REGEX, MONTHS, NUMBERED_REGEX,
  OPEN_END, ORG_REGEX, ParsedCv, RANGE_REGEX, SINGLE_DATE_REGEX, SectionKey, URL_REGEX, YEAR_REGEX, canonicalDegree, headingKeyOf, inlineHeadingOf, squash
} from './cv.model';

interface Segment { key: SectionKey; blocks: CvBlock[]; }

const OPEN_END_REGEX = new RegExp(`^(${OPEN_END})$`, 'i');
const LABEL_REGEX = /^([A-Za-z][A-Za-z0-9 /().'’&-]{1,38}?)\s*[:：]\s*(.*)$/;
const DEGREE_START_REGEX = /^\(?\s*(?:ssc|s\.\s?s\.\s?c|hsc|h\.\s?s\.\s?c|psc|jsc|b\.?\s?sc|m\.?\s?sc|bsc|msc|bba|mba|b\.?\s?a|m\.?\s?a|bss|mss|b\.?\s?com|m\.?\s?com|mphil|ph\.?\s?d|mbbs|llb|post\s*graduat\w*|diploma|bachelor|master|honou?rs|higher secondary|secondary school|dakhil|alim|o-level|a-level|b\.?\s?tech|b\.?\s?e)\b/i;
const PROFESSIONAL_START = /^\(?(?:chartered accountan(?:t|cy)|acca|aca|fca|cma|cpa)\b/i;
const DEGREE_ABBREVIATION_START =/^\(?(?:[BM]\.?(?:[A-Z]{2,4}|[A-Z][a-z]{1,4})|DVM|BDS)\b/;
const EDU_LABELS ='level\\s*of\\s*education|exam\\s*\\/\\s*degree\\s*title|degree\\s*title|degree|institute|institution|university|board|subject|group|major|concentration|department|result|grade|cgpa|gpa|passing\\s*year|pass\\s*year|year\\s*of\\s*passing|year';
const DEGREE_LABEL_START = /^(level\s*of\s*education|exam\s*\/\s*degree\s*title|degree\s*title|degree)\s*:/i;
const EDU_LABEL_LINE = new RegExp(`^(?:${EDU_LABELS})\\b\\s*(?:\\([^)]*\\))?\\s*:`, 'i');
const EDU_LABEL_SPLIT =new RegExp(`(?=\\b(?:${EDU_LABELS})\\b\\s*(?:\\([^)]*\\))?\\s*:)`, 'i');
const SCALE_REGEX = /(\d+(?:\.\d+)?)\s*(?:\(\s*)?(?:out of|\/)\s*(\d+(?:\.\d+)?)/i;
const BARE_DOMAIN_REGEX = /(?<![\w@./-])(?:[a-z0-9-]+\.)+(?:com|dev|io|net|org|me|co|app|xyz|info|bd|tech|site|online|page)\b(?:\/[^\s,;)]*)?/gi;
const NOISE_REGEX =/^(powered by\b|page\s+\d+(\s*(of|\/)\s*\d+)?$|\d+\s*\/\s*\d+$|curriculum vitae$|resume$|r[eé]sum[eé]$)/i;
const TRAINING_REGEX =/\b(training|course|workshop|bootcamp|certificate course)\b/i;

export function splitSections(blocks: CvBlock[]): Segment[] {
  const segments: Segment[] = [{ key: 'header', blocks: [] }];
  let current = segments[0];
  const open = (key: SectionKey) => {
    current = { key, blocks: [] };
    segments.push(current);
  };
  for (const block of blocks) {
    if (block.separator) {
      open('header');
      continue;
    }
    if (block.table) {
      current.blocks.push(block);
      continue;
    }
    if (NOISE_REGEX.test(block.text)) continue;
    const key = headingKeyOf(block.text);
    if (key) {
      open(key);
      continue;
    }
    const inline = inlineHeadingOf(block.text);
    if (inline && !(current.key === 'skills' && inline.key === 'languages')) {
      open(inline.key);
      current.blocks.push({ text: inline.rest, parts: [inline.rest] });
      continue;
    }
    current.blocks.push(block);
  }
  return repairSegments(segments.map(s => ({ key: s.key, blocks: tableize(s.blocks) })));
}

const LANGUAGE_NAME_REGEX = new RegExp(`\\b(${Object.keys(LANGUAGE_ALIASES).join('|')})\\b`, 'i');

function repairSegments(segments: Segment[]): Segment[] {
  const strayLanguages: CvBlock[] = [];
  segments.filter(s => s.key === 'skills').forEach(segment => {
    segment.blocks = segment.blocks.filter(b => {
      const stray = !b.table && !!LANGUAGE_ALIASES[squash(b.text)];
      if (stray) strayLanguages.push(b);
      return !stray;
    });
  });
  if (strayLanguages.length) {
    const existing = segments.find(s => s.key === 'languages');
    if (existing) existing.blocks.push(...strayLanguages);
    else segments.push({ key: 'languages', blocks: strayLanguages });
  }
  segments.forEach((segment, index) => {
    if (segment.key !== 'languages' || index === 0) return;
    const target = segments.slice(0, index).reverse().find(s => s.key !== 'header');
    const misplaced = segment.blocks.filter(b => !b.table && !LANGUAGE_NAME_REGEX.test(b.text));
    if (target && misplaced.length && misplaced.length < segment.blocks.length) {
      target.blocks.push(...misplaced);
      segment.blocks = segment.blocks.filter(b => !misplaced.includes(b));
    }
  });
  return segments;
}

function parseDate(value: string): Date | null {
  const v = value.trim().toLowerCase();
  if (OPEN_END_REGEX.test(v)) return null;
  const fullYear = v.match(/\d{4}/);
  const shortYear = v.match(/['’](\d{2})/);
  const year = fullYear || (shortYear ? [String(2000 + +shortYear[1])] : null);
  if (!year) return null;
  const month = MONTHS.findIndex(m => v.startsWith(m));
  if (month >= 0) return new Date(+year[0], month, 1);
  const numeric = v.match(/^(\d{1,2})\s*[/.-]\s*\d{4}$/);
  if (numeric && +numeric[1] >= 1 && +numeric[1] <= 12) return new Date(+year[0], +numeric[1] - 1, 1);
  return new Date(+year[0], 0, 1);
}

function tidy(text: string): string {
  return text
    .replace(/\(\s*\)/g, ' ')
    .replace(/\(\s*[\d.]+\s*(?:yrs?|years?|months?|mos?)\s*\)/gi, ' ')
    .replace(/^[\s)|,–—:-]+|[\s(|,–—:-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRange(line: string): { start: Date | null; end: Date | null; current: boolean; rest: string } | null {
  const match = line.match(RANGE_REGEX);
  if (!match) return null;
  const second = (match[2] ?? match[3]).trim();
  const isOpen = OPEN_END_REGEX.test(second);
  return {
    start: parseDate(match[1]),
    end: isOpen ? null : parseDate(second),
    current: isOpen,
    rest: tidy(line.replace(match[0], ' '))
  };
}

function isBullet(line: string): boolean {
  return BULLET_REGEX.test(line);
}

const TITLE_CONNECTORS = new Set(['of', 'and', 'at', 'in', 'for', 'to', 'the', 'a', 'an', '&', 'de', 'la', 'on', 'with']);

function isTitleCase(text: string): boolean {
  return text.replace(/\([^)]*\)/g, ' ').split(/\s+/).filter(w => w).every(w => !/^[a-z]/.test(w) || TITLE_CONNECTORS.has(w) || /\d/.test(w));
}

function isEntryBullet(clean: string): boolean {
  const range = parseRange(clean);
  if (!range || words(range.rest) > 12) return false;
  const lead = clean.split(/\s+/).slice(0, 5).join(' ');
  return JOB_TITLE_REGEX.test(lead);
}

function plainLines(blocks: CvBlock[]): string[] {
  return blocks.filter(b => !b.table && !b.separator).map(b => b.text).filter(t => t);
}

function words(text: string): number {
  return text.split(/\s+/).filter(w => w).length;
}

function tokensOf(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 1);
}

function overlap(a: string, b: string): number {
  const ta = new Set(tokensOf(a));
  const tb = tokensOf(b);
  if (!ta.size || !tb.length) return 0;
  const common = tb.filter(t => ta.has(t)).length;
  return common / Math.min(ta.size, tb.length);
}

function splitTitleAndOrg(text: string): { title: string; organizationName: string; location?: string } {
  let pieces = text.split(/\s+(?:at|@)\s+|\s*[|•]\s*|\s+[-–—]\s+/i).map(p => p.trim()).filter(p => p);
  if (pieces.length === 1) {
    const commaPieces = text.split(/,\s+/).map(p => p.trim()).filter(p => p);
    const rest = commaPieces.slice(1).join(', ');
    if (commaPieces.length >= 2 && JOB_TITLE_REGEX.test(commaPieces[0]) && !JOB_TITLE_REGEX.test(commaPieces[1]) && (ORG_REGEX.test(rest) || words(rest) >= 2)) {
      pieces = [commaPieces[0], rest];
    }
  }
  const title = pieces.find(p => JOB_TITLE_REGEX.test(p)) || pieces[0] || '';
  const org = pieces.find(p => p !== title) || '';
  return { title: title.slice(0, 150), organizationName: org.slice(0, 150) };
}

const ORG_END_REGEX = /^(.*?\b(?:ltd|limited|inc|incorporated|llc|corp|corporation|company|co|bank|group|plc|pvt|gmbh)\b\.?)[\s,|·•-]+(\S.*)$/i;
const EMPLOYMENT_TYPE_REGEX = /\s*[|·•-]?\s*\b(full[- ]?time|part[- ]?time|contract|internship|freelance|remote|on[- ]?site|hybrid|permanent)\b\s*$/i;

function splitOrgAndLocation(rawText: string): { org: string; location?: string } {
  const text = rawText.replace(EMPLOYMENT_TYPE_REGEX, '').trim();
  const ended = text.match(ORG_END_REGEX);
  if (ended) return { org: ended[1].trim(), location: ended[2].replace(/[\s,|·•-]+$/, '').trim() || undefined };
  const pieces = text.split(/\s*,\s+|\s+,\s*/).map(p => p.trim()).filter(p => p);
  if (pieces.length <= 1) return { org: text.trim() };
  let end = 0;
  for (let i = 0; i < pieces.length; i++) {
    if (ORG_REGEX.test(pieces[i]) && !LOCATION_REGEX.test(pieces[i])) { end = i; break; }
  }
  const org = pieces.slice(0, end + 1).join(', ');
  const location = pieces.slice(end + 1).join(', ');
  return { org: org.replace(/[,\s]+$/, ''), location: location || undefined };
}

export function parseExperience(blocks: CvBlock[]): any[] {
  const entries: any[] = [];
  let cur: any = null;

  const create = (init: any) => {
    cur = { title: '', organizationName: '', location: undefined, startDate: null, endDate: null, current: false, description: '', hasDates: false, phase: 'header', ...init };
    entries.push(cur);
  };
  const setOrg = (text: string) => {
    const split = splitOrgAndLocation(text);
    cur.organizationName = split.org.slice(0, 150);
    if (split.location && !cur.location) cur.location = split.location.slice(0, 150);
  };
  const addDescription = (text: string) => {
    cur.description = `${cur.description}${cur.description ? '\n' : ''}${text}`;
  };
  const setTitle = (text: string) => {
    const split = splitTitleAndOrg(text.replace(/\(\s*[\d.]+\s*(?:yrs?|years?)\s*\)/gi, ' ').replace(/\s+/g, ' ').trim());
    cur.title = split.title.slice(0, 150);
    if (split.organizationName && !cur.organizationName) cur.organizationName = split.organizationName;
  };

  const allLines = plainLines(blocks);
  for (let lineIndex = 0; lineIndex < allLines.length; lineIndex++) {
    const raw = allLines[lineIndex];
    const nextLine = (allLines[lineIndex + 1] || '').replace(BULLET_REGEX, '').trim();
    if (/^total\b/i.test(raw) || /^experience\s*\(/i.test(raw)) continue;
    const bulletEntry = isBullet(raw) && isEntryBullet(raw.replace(BULLET_REGEX, '').trim());
    const bullet = isBullet(raw) && !bulletEntry;
    let clean = raw.replace(BULLET_REGEX, '').replace(NUMBERED_REGEX, '').trim();
    const periodLabel = clean.match(/^(?:period|duration|tenure|dates?|years?)\s*:\s*(.+)$/i);
    if (periodLabel) clean = periodLabel[1].trim();
    if (!clean) continue;

    const label = clean.match(LABEL_REGEX);
    if (label && /^(company|organi[sz]ation|employer|firm|institution)$/i.test(label[1].trim())) {
      if (!cur) create({});
      setOrg(label[2]);
      continue;
    }
    if (label && /^(designation|position|job title|post|title)$/i.test(label[1].trim())) {
      if (!cur || cur.title) create({});
      cur.title = label[2].trim().slice(0, 150);
      continue;
    }
    if (label && /^(company location|location|city)$/i.test(label[1].trim())) {
      if (cur) cur.location = label[2].trim().slice(0, 150);
      continue;
    }
    if (label && /^(department|dept|industry|employment type|job type|role)$/i.test(label[1].trim())) continue;
    if (label && /^(area of expertise|responsibilit\w*|duties|achievements?|key responsibilit\w*)$/i.test(label[1].trim())) {
      if (cur) { cur.phase = 'body'; if (label[2]) addDescription(label[2]); }
      continue;
    }

    const range = bullet ? null : parseRange(clean);
    if (range) {
      const header = range.rest ? splitTitleAndOrg(range.rest) : null;
      const dateless = !!cur && !cur.hasDates && (cur.phase === 'header' || (cur.description.split('\n').length <= 1 && (!!cur.title || !!cur.organizationName)));
      if (cur && dateless) {
        cur.hasDates = true;
        cur.startDate = range.start;
        cur.endDate = range.end;
        cur.current = range.current;
        if (header && !cur.title) {
          cur.title = header.title;
          if (header.organizationName && !cur.organizationName) cur.organizationName = header.organizationName;
        } else if (header && header.title && !cur.organizationName) {
          setOrg(range.rest);
        }
      } else {
        create({ hasDates: true, startDate: range.start, endDate: range.end, current: range.current });
        if (header) {
          cur.title = header.title;
          cur.organizationName = header.organizationName;
        }
      }
      continue;
    }

    const hasOrgWord = ORG_REGEX.test(clean);
    const org = hasOrgWord && !JOB_TITLE_REGEX.test(clean);
    const job = JOB_TITLE_REGEX.test(clean) && !org && (words(clean) <= 4 || isTitleCase(clean));
    const titleLead = JOB_TITLE_REGEX.test(clean.split(/\s+/).slice(0, 5).join(' ')) && /\s(?:at|@)\s|\s[-–—|]\s/.test(clean);
    const compact = titleLead ? clean.length <= 130 && words(clean) <= 18 : clean.length <= 90 && words(clean) <= 10;
    const short = compact && (!/[.!?:]$/.test(clean) || hasOrgWord || LOCATION_REGEX.test(clean));

    if (!cur) {
      if (!bullet && short && (job || org)) {
        create({});
        if (job) setTitle(clean);
        else setOrg(clean);
      }
      continue;
    }
    if (bullet) {
      cur.phase = 'body';
      addDescription(clean);
      continue;
    }
    if (cur.phase === 'header') {
      if (short && job) {
        if (!cur.title) setTitle(clean);
        else if (!JOB_TITLE_REGEX.test(cur.title) && !cur.organizationName) { cur.organizationName = cur.title; setTitle(clean); }
        else { create({}); setTitle(clean); }
      } else if (short && !cur.organizationName) {
        setOrg(clean);
      } else if (short && !cur.location && (LOCATION_REGEX.test(clean) || clean.includes(','))) {
        cur.location = clean.slice(0, 150);
      } else {
        cur.phase = 'body';
        addDescription(clean);
      }
    } else if (short && job && !cur.description.endsWith(',') && words(clean) <= 7) {
      create({});
      setTitle(clean);
    } else if (short && org && !!nextLine && (!!parseRange(nextLine) || JOB_TITLE_REGEX.test(nextLine)) && words(nextLine) <= 14) {
      create({});
      setOrg(clean);
    } else {
      addDescription(clean);
    }
  }

  return entries
    .filter(e => e.title || e.organizationName)
    .slice(0, 15)
    .map(e => ({
      title: e.title.replace(/\s*\(\s*[\d.]+\s*(?:yrs?|years?)\s*\)/gi, '').trim(),
      organizationName: e.organizationName,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      description: e.description.trim() || undefined
    }));
}

function chunkLabels(text: string): { label: string; value: string }[] {
  return text.split(EDU_LABEL_SPLIT).map(chunk => {
    const m = chunk.match(/^\s*([A-Za-z /]+?)\s*(?:\([^)]*\))?\s*:\s*(.*)$/);
    return m ? { label: m[1].toLowerCase().replace(/\s+/g, ' ').trim(), value: m[2].trim() } : { label: '', value: chunk.trim() };
  });
}

const CLASS_REGEX = /\b(\d+(?:st|nd|rd|th)|first|second|third)\s+(?:class|division)\b/i;

function gradeFrom(text: string): string | undefined {
  const m = text.match(/\b(?:cgpa|gpa|grade|result)\b[^\d\n]{0,14}(\d+(?:\.\d+)?)(?:\s*\(?\s*(?:out of|\/)\s*(\d+(?:\.\d+)?)\s*\)?)?/i);
  if (m && (m[2] || +m[1] <= 10)) return m[2] ? `${m[1]}/${m[2]}` : m[1];
  const classMatch = text.match(CLASS_REGEX);
  return classMatch ? classMatch[0] : undefined;
}

function fieldFrom(text: string): string | undefined {
  const sorted = [...FIELDS].sort((a, b) => b.length - a.length);
  const found = sorted.find(f => new RegExp(`(^|[^A-Za-z])${f.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&')}(?![A-Za-z])`, 'i').test(text));
  return found;
}

function fieldFromDegreeText(text: string): string | undefined {
  const known = fieldFrom(stripDegreeNames(text));
  if (known) return known;
  const inMatch = text.match(/\bin\s+([A-Za-z][A-Za-z &]+?)\s*(?:[,(]|$)/i);
  if (inMatch) return inMatch[1].trim();
  const paren = text.match(/\(([A-Za-z][A-Za-z &]{3,})\)/);
  if (paren && !DEGREE_CANON.some(d => d.re.test(paren[1]))) return paren[1].trim();
  return undefined;
}

function stripDegreeNames(text: string): string {
  let result = text.replace(/\b(?:master|bachelor|doctor)s?\s+of\s+(?:science|arts|commerce|laws?|philosophy|business administration|engineering|social science)\b/gi, ' ');
  for (const entry of DEGREE_CANON) result = result.replace(new RegExp(entry.re.source, 'gi'), ' ');
  return result;
}

function educationFromBlock(lines: string[]): any | null {
  const joined = lines.join(' ');
  const head = lines[0];
  const chunks = chunkLabels(joined);
  const labelled = (names: string[]) => chunks.find(c => names.includes(c.label) && c.value)?.value;
  const degreeLabel = labelled(['degree', 'degree title', 'exam/degree title']);
  const degreeToken = canonicalDegree((degreeLabel || head).replace(/^\(?\s*/, ''));
  const range = lines.map(l => parseRange(l)).find(r => r);
  let institution = labelled(['institute', 'institution']) || '';
  const university = labelled(['university']) || '';
  let field = labelled(['subject', 'group', 'major', 'concentration', 'department']) || (degreeLabel ? fieldFromDegreeText(degreeLabel) : undefined);
  let endYear = labelled(['passing year', 'pass year', 'year of passing', 'year']);
  const plainLines = lines.slice(1)
    .filter(l => !EDU_LABEL_LINE.test(l) && !LABEL_REGEX.test(l))
    .map(l => l.replace(RANGE_REGEX, '').replace(/^[|,–—\s-]+|[,|–—\s-]+$/g, '').trim())
    .filter(l => l && !/^\(?\d{4}\)?$/.test(l) && !/^(cgpa|gpa|grade|result)\b/i.test(l));
  const headParts = head.replace(RANGE_REGEX, ' ').split(/,\s+|\s+[-–—|]\s+|\s+from\s+/i).map(p => p.trim()).filter(p => p);
  const instParts: string[] = [];
  for (const part of headParts.slice(1)) {
    if (/^\(?\d{4}\)?$|\b(?:cgpa|gpa|grade|result)\b/i.test(part)) break;
    if (INSTITUTION_REGEX.test(part) || /^[A-Z]{3,8}$/.test(part) || instParts.length) instParts.push(part.replace(/\s*\(\s*\d{4}\s*\)\s*$/, '').trim());
  }
  const inlineInstitution = instParts.join(', ');
  let institutionLine = '';
  if (!institution) {
    const keyword = plainLines.find(l => INSTITUTION_REGEX.test(l));
    if (keyword) institutionLine = keyword;
    else if (inlineInstitution) institution = inlineInstitution;
    else if (plainLines.length >= 2) institutionLine = plainLines[plainLines.length - 1];
    else if (plainLines.length === 1 && !fieldFrom(plainLines[0])) institutionLine = plainLines[0];
    institution = institution || institutionLine || university;
  }
  if (!field) {
    const fieldLine = plainLines.length >= 2 ? plainLines.find(l => l !== institutionLine && !INSTITUTION_REGEX.test(l) && !/\d/.test(l)) : undefined;
    const headWithoutInstitution = instParts.reduce((text, part) => text.replace(part, ' '), head);
    const afterDegree = stripDegreeNames(headWithoutInstitution.replace(RANGE_REGEX, ' ').replace(/\b(?:cgpa|gpa|passing year|pass year|result)\b.*$/i, '')).replace(/^\(?\s*[A-Za-z.]{1,12}\s*\)?\b/, ' ');
    const joinedWithoutInstitution = institution ? joined.replace(institution, ' ') : joined;
    field = fieldLine || fieldFromDegreeText(headParts[0] || head) || fieldFrom(afterDegree) || fieldFrom(stripDegreeNames(joinedWithoutInstitution));
  }
  const year = (endYear || '').match(YEAR_REGEX) || (!range ? joined.match(YEAR_REGEX) : null);
  const grade = gradeFrom(joined);
  if (!institution && degreeToken === head) return null;
  return {
    institution: institution.slice(0, 150),
    degree: degreeToken,
    fieldOfStudy: field,
    startDate: range?.start || null,
    endDate: range ? range.end : (year ? new Date(+year[0], 0, 1) : null),
    current: range?.current || false,
    grade
  };
}

function educationFromLines(lines: string[]): any[] {
  const cleaned = lines.map(l => l.replace(BULLET_REGEX, '').replace(NUMBERED_REGEX, '').trim()).filter(l => l);
  const starts: number[] = [];
  cleaned.forEach((l, i) => { if (/^level\s*of\s*education\s*:/i.test(l)) starts.push(i); });
  if (!starts.length) cleaned.forEach((l, i) => { if (/^(exam\s*\/\s*degree\s*title|degree\s*title|degree)\s*:/i.test(l)) starts.push(i); });
  if (!starts.length) cleaned.forEach((l, i) => { if ((DEGREE_START_REGEX.test(l) || DEGREE_ABBREVIATION_START.test(l) || PROFESSIONAL_START.test(l)) && !EDU_LABEL_LINE.test(l)) starts.push(i); });
  const items: any[] = [];
  if (starts.length) {
    const before = (s: number) => {
      const candidate = cleaned[s - 1];
      return s > 0 && !!candidate && INSTITUTION_REGEX.test(candidate) && !DEGREE_START_REGEX.test(candidate) && !parseRange(candidate) && !YEAR_REGEX.test(candidate) ? candidate : null;
    };
    const instFirst = starts.every(s => before(s) !== null);
    starts.forEach((s, k) => {
      const blockStart = instFirst ? s - 1 : s;
      const blockEnd = starts[k + 1] !== undefined ? (instFirst ? starts[k + 1] - 1 : starts[k + 1]) : cleaned.length;
      const block = instFirst ? [cleaned[s], ...cleaned.slice(s + 1, blockEnd), cleaned[blockStart]] : cleaned.slice(blockStart, blockEnd);
      const item = educationFromBlock(block);
      if (item) items.push(item);
    });
    return items;
  }
  const blocks: string[][] = [];
  let block: string[] = [];
  for (const line of cleaned) {
    const startsNew = block.length && (INSTITUTION_REGEX.test(line) || !!parseRange(line)) && block.some(l => INSTITUTION_REGEX.test(l)) && block.some(l => !!parseRange(l) || YEAR_REGEX.test(l));
    if (startsNew) { blocks.push(block); block = []; }
    block.push(line);
  }
  if (block.length) blocks.push(block);
  for (const b of blocks) {
    const joined = b.join(' ');
    if (!INSTITUTION_REGEX.test(joined)) continue;
    const range = b.map(l => parseRange(l)).find(r => r);
    const institution = b.find(l => INSTITUTION_REGEX.test(l)) || '';
    const degree = canonicalDegree(joined);
    items.push({
      institution: institution.replace(RANGE_REGEX, '').replace(/[,|–—-]\s*$/, '').trim().slice(0, 150),
      degree: degree === joined.replace(/\s+/g, ' ').trim() ? '' : degree,
      fieldOfStudy: fieldFrom(joined),
      startDate: range?.start || null,
      endDate: range ? range.end : (joined.match(YEAR_REGEX) ? new Date(+joined.match(YEAR_REGEX)![0], 0, 1) : null),
      current: range?.current || false,
      grade: gradeFrom(joined)
    });
  }
  return items;
}

function roleOf(label: string): string {
  const l = label.toLowerCase();
  if (/designation|position|job title|^title$|^post$|^role$/.test(l)) return 'jobtitle';
  if (/organi[sz]ation|company|employer|firm|workplace/.test(l)) return 'org';
  if (/exam|degree|qualification|level|certification|training title|course/.test(l) && !/year/.test(l)) return 'name';
  if (/major|concentration|subject|group|department|field|topic/.test(l)) return 'major';
  if (/institute|institution|school|college|issuer|provider|issued|authority/.test(l)) return 'institute';
  if (/board|university/.test(l)) return 'board';
  if (/result|grade|cgpa|gpa|marks/.test(l)) return 'result';
  if (/year/.test(l)) return 'year';
  if (/duration/.test(l)) return 'duration';
  if (/^from$/.test(l)) return 'from';
  if (/^to$/.test(l)) return 'to';
  if (/location|country/.test(l)) return 'location';
  if (/language/.test(l)) return 'language';
  if (/speaking/.test(l)) return 'speaking';
  if (/reading/.test(l)) return 'reading';
  if (/writing/.test(l)) return 'writing';
  return 'other';
}

function tableRecords(table: string[][]): { roles: string[]; rows: { [role: string]: string }[] } {
  const roles = table[0].map(roleOf);
  const rows = table.slice(1).map(row => {
    const record: { [role: string]: string } = {};
    row.forEach((cell, i) => {
      const role = roles[i] === 'other' ? `other${i}` : roles[i];
      if (!record[role]) record[role] = cell.trim();
    });
    return record;
  });
  return { roles, rows };
}

function tableKind(table: string[][]): string {
  const joined = table[0].join(' ').toLowerCase();
  if (/language/.test(joined) && /reading|writing|speaking|proficiency/.test(joined)) return 'language';
  if (/training title|topic/.test(joined)) return 'training';
  if (/certification/.test(joined) && !/exam/.test(joined)) return 'certification';
  if (/designation|position|job title|company|organi[sz]ation|employer/.test(joined) && !/exam|degree/.test(joined)) return 'experience';
  if (/exam|degree|institute|institution/.test(joined)) return 'education';
  return 'unknown';
}

function experienceFromTable(table: string[][]): any[] {
  return tableRecords(table).rows.map(rec => {
    const rangeText = Object.values(rec).find(value => RANGE_REGEX.test(value));
    const range = rangeText ? parseRange(rangeText) : null;
    const from = dateFromCell(rec['from'] || '');
    const to = dateFromCell(rec['to'] || '');
    const openEnd = new RegExp(`^(${OPEN_END})$`, 'i').test((rec['to'] || '').trim());
    return {
      title: (rec['jobtitle'] || '').slice(0, 150),
      organizationName: (rec['org'] || '').slice(0, 150),
      location: rec['location'] || undefined,
      startDate: range ? range.start : from,
      endDate: range ? range.end : to,
      current: range ? range.current : openEnd,
      description: undefined
    };
  }).filter(e => e.title || e.organizationName);
}

function parseExperienceSegment(blocks: CvBlock[]): any[] {
  const fromTables = blocks.filter(b => b.table && tableKind(b.table) === 'experience').flatMap(b => experienceFromTable(b.table as string[][]));
  return [...fromTables, ...parseExperience(blocks.filter(b => !b.table))];
}

function dateFromCell(text: string): Date | null {
  const m = text.match(SINGLE_DATE_REGEX);
  return m ? parseDate(m[0]) : null;
}

function educationFromRecord(rec: { [role: string]: string }): any | null {
  const name = rec['name'] || '';
  if (!name && !rec['institute']) return null;
  const year = (rec['year'] || '').match(YEAR_REGEX);
  const scale = (rec['result'] || '').match(SCALE_REGEX);
  const classGrade = (rec['result'] || '').match(CLASS_REGEX);
  const number = classGrade ? null : (rec['result'] || '').match(/\d+(?:\.\d+)?/);
  const institution = rec['institute'] || rec['board'] || '';
  return {
    institution: institution.slice(0, 150),
    degree: canonicalDegree(name),
    fieldOfStudy: rec['major'] || fieldFromDegreeText(name),
    startDate: null,
    endDate: year ? new Date(+year[0], 0, 1) : null,
    current: false,
    grade: scale ? `${scale[1]}/${scale[2]}` : (classGrade ? classGrade[0] : (number ? number[0] : undefined))
  };
}

function certificationFromRecord(rec: { [role: string]: string }): any | null {
  const name = (rec['name'] || '').trim();
  if (name.length < 3) return null;
  const year = (rec['year'] || '').match(YEAR_REGEX);
  const date = dateFromCell(rec['to'] || '') || dateFromCell(rec['from'] || '') || (year ? new Date(+year[0], 0, 1) : null);
  return { name: name.slice(0, 150), issuer: (rec['institute'] || rec['board'] || undefined), date, credentialUrl: undefined };
}

export function parseEducation(segments: Segment[]): { education: any[]; trainings: any[] } {
  const education: any[] = [];
  const trainings: any[] = [];
  for (const segment of segments) {
    const loose: CvBlock[] = [];
    for (const block of segment.blocks) {
      if (!block.table) { loose.push(block); continue; }
      const { rows } = tableRecords(block.table);
      for (const rec of rows) {
        if (TRAINING_REGEX.test(rec['name'] || '')) {
          const cert = certificationFromRecord({ ...rec, name: rec['name'] + (rec['major'] ? ` - ${rec['major']}` : '') });
          if (cert) trainings.push(cert);
        } else {
          const item = educationFromRecord(rec);
          if (item) education.push(item);
        }
      }
    }
    education.push(...educationFromLines(plainLines(loose)));
  }
  return { education: education.slice(0, 10), trainings };
}

function skillLevel(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/expert|master/.test(t)) return 'Expert';
  if (/advanced|proficient|excellent|high/.test(t)) return 'Advanced';
  if (/intermediate|medium|good|average/.test(t)) return 'Intermediate';
  if (/beginner|basic|low|fair|elementary/.test(t)) return 'Beginner';
  return undefined;
}

const LEVEL_WORDS = 'expert|advanced|intermediate|beginner|basic|proficient|fluent|medium|high|low|good|excellent|average|master|elementary';

function splitSkillLine(line: string): { name: string; level?: string }[] {
  const leveled = [...line.matchAll(new RegExp(`([^()]+?)\\s*\\(\\s*(${LEVEL_WORDS})\\s*\\)`, 'gi'))];
  if (leveled.length >= 2) return leveled.map(m => ({ name: m[1].replace(/^[\s,;|•]+/, '').trim(), level: skillLevel(m[2]) }));
  const parts: string[] = [];
  for (const piece of line.split(/[,;|•●▪·]|\s{3,}/)) {
    const amp = piece.split(/\s&\s/);
    if (amp.length > 1 && amp.some(p => words(p) >= 2)) parts.push(...amp);
    else parts.push(piece);
  }
  return parts.map(p => {
    const m = p.match(new RegExp(`^(.*?)\\s*\\(\\s*(${LEVEL_WORDS})\\s*\\)\\s*$`, 'i'));
    return m ? { name: m[1].trim(), level: skillLevel(m[2]) } : { name: p.trim() };
  });
}

const SKILL_SEPARATORS = /[,;|•●▪·]/;
const CATEGORY_REGEX = /\b(development|databases?|reporting|testing|tools?|frameworks?|libraries|languages?|cloud|devops|docs|documentation|design|mobile|desktop|back-?end|front-?end|web|others?|technologies|platforms?|methodologies)\b/i;
const LEGEND_REGEX = /^\W*(expert|advanced|intermediate|beginner|familiar|famil\w*|proficient)\W*$/i;
const LEVELLED_REGEX = new RegExp(`\\(\\s*(${LEVEL_WORDS})\\s*\\)`, 'i');

function prepareSkillLine(raw: string): string | null {
  let line = raw.replace(BULLET_REGEX, '').trim();
  const label = line.match(LABEL_REGEX);
  if (label) {
    if (!label[2].trim()) return null;
    if (label[1].split(' ').length <= 4) line = label[2];
  }
  if (/[.]$/.test(line) && words(line) > 7 && !/,/.test(line)) return null;
  return line;
}

export function parseSkills(segments: Segment[]): any[] {
  const seen = new Set<string>();
  const result: any[] = [];
  const textLines = (blocks: CvBlock[]) => blocks.filter(b => !b.table && !b.separator && b.text).map(b => b.text);
  const cellLines = (blocks: CvBlock[]) => blocks
    .filter(b => !b.table && !b.separator && b.text)
    .flatMap(b => (b.parts.length >= 2 && b.cells && !/[,;|•●▪·:]/.test(b.text) ? b.parts : [b.text]));
  const prepared = (lines: string[]) => lines.map(prepareSkillLine).filter((l): l is string => !!l);
  const candidatesOf = (lines: string[]) => lines.map(line => {
    const chips = !SKILL_SEPARATORS.test(line) && !LEVELLED_REGEX.test(line) && words(line) >= 2 ? skillTermsIn(line) : null;
    return { line, chips: chips && chips.hits >= 2 ? chips.items : null, hits: chips ? chips.hits : 0 };
  });
  const textCandidates = candidatesOf(prepared(segments.flatMap(s => textLines(s.blocks))));
  const chipLines = textCandidates.filter(c => c.chips);
  const chipSection = chipLines.length >= 3 && chipLines.reduce((n, c) => n + c.hits, 0) >= 8;
  const candidates = chipSection ? textCandidates : candidatesOf(prepared(segments.flatMap(s => cellLines(s.blocks))));
  const analysed = candidates.map(c => {
    if (!chipSection) return { ...c, chips: null, hits: 0 };
    if (!c.chips && words(c.line) === 1) {
      const repaired = repairSkillTerm(c.line);
      if (repaired) return { ...c, chips: [repaired], hits: 1 };
    }
    return c;
  });
  analysed.forEach((entry, index) => {
    const next = analysed[index + 1];
    const bare = !entry.chips && !SKILL_SEPARATORS.test(entry.line) && entry.hits === 0 && words(entry.line) <= 3;
    const category = bare && ((!!next && !!next.chips) || (chipSection && (CATEGORY_REGEX.test(entry.line) || LEGEND_REGEX.test(entry.line))));
    if (category) return;
    const items = entry.chips ? entry.chips.map(name => ({ name })) : splitSkillLine(entry.line);
    for (const item of items) {
      const name = item.name.replace(BULLET_REGEX, '').replace(/[.:]+$/, '').trim();
      if (name.length < 2 || name.length > 40 || words(name) > 5) continue;
      if (!/[A-Za-z]/.test(name) || /\d{6,}|@|https?:|www\./i.test(name)) continue;
      if (/^(skills?|specialization|fields of specialization)$/i.test(name)) continue;
      if (/\b(program(me)?|center|centre|institute|university|ltd|limited)\b/i.test(name)) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push((item as any).level ? { name, level: (item as any).level } : { name });
    }
  });
  return result.slice(0, 40);
}

function languageLevel(hint: string): string | undefined {
  const h = hint.toLowerCase();
  if (/native|mother/.test(h)) return 'Native';
  if (/fluent|advanced|proficient|excellent|high|expert/.test(h)) return 'Fluent';
  if (/conversational|intermediate|good|medium|moderate|average/.test(h)) return 'Conversational';
  if (/basic|beginner|elementary|fair|low|poor/.test(h)) return 'Basic';
  return undefined;
}

export function parseLanguages(segments: Segment[]): any[] {
  const result: any[] = [];
  const add = (name: string, level?: string) => {
    if (!result.some(r => r.name === name)) result.push({ name, proficiency: level });
  };
  for (const segment of segments) {
    const loose: CvBlock[] = [];
    for (const block of segment.blocks) {
      if (!block.table) { loose.push(block); continue; }
      const { rows } = tableRecords(block.table);
      for (const rec of rows) {
        const alias = LANGUAGE_ALIASES[(rec['language'] || rec['name'] || '').toLowerCase().replace(/[^a-z]/g, '')];
        if (!alias) continue;
        add(alias, languageLevel(rec['speaking'] || '') || languageLevel(rec['reading'] || '') || languageLevel(rec['writing'] || '') || languageLevel(Object.values(rec).join(' ')));
      }
    }
    const text = plainLines(loose).join(' ');
    const pattern = new RegExp(`\\b(${Object.keys(LANGUAGE_ALIASES).join('|')})\\b`, 'gi');
    const matches = [...text.matchAll(pattern)];
    matches.forEach((m, i) => {
      const end = (m.index ?? 0) + m[0].length;
      const next = matches[i + 1]?.index ?? text.length;
      const tail = text.slice(end, Math.min(next, end + 24));
      const near = tail.match(/^\s*(?:[-–:]\s*|\(\s*)?([A-Za-z]{3,15})/);
      add(LANGUAGE_ALIASES[m[1].toLowerCase()], near ? languageLevel(near[1]) : undefined);
    });
  }
  return result;
}

function lineCertification(line: string, issuerLines: string[]): any | null {
  const dateMatch = line.match(SINGLE_DATE_REGEX);
  const url = line.match(URL_REGEX);
  const text = line.replace(BULLET_REGEX, '').replace(NUMBERED_REGEX, '').replace(URL_REGEX, '').replace(SINGLE_DATE_REGEX, '').replace(/[()|,–—-]+\s*$/g, '').replace(/^[()|,–—-]+\s*/, '').trim();
  const commaIndex = text.search(/,\s+/);
  const dashed = text.match(/^(.*?)\s+[-–—]\s+(.+)$/);
  const dashBeforeDate = new RegExp(`\\s[-–—]\\s*(?:${DATE_PART})\\s*$`, 'i').test(line);
  const dashIsIssuer = !!dashed && (dashBeforeDate || words(dashed[2]) >= 2 || /^[A-Z][a-z]{3,}$/.test(dashed[2].trim()));
  const [name, issuer] = commaIndex > 0
    ? [text.slice(0, commaIndex), text.slice(commaIndex).replace(/^,\s*/, '')]
    : dashIsIssuer ? [(dashed as RegExpMatchArray)[1], (dashed as RegExpMatchArray)[2]] : text.split(/\s+(?:by|from|[|])\s+/i);
  const issuerText = issuer?.trim() || issuerLines.join(' ').replace(/[\s,.]+$/, '').trim() || undefined;
  if (!name || name.trim().length < 3) return null;
  return { name: name.trim().slice(0, 150), issuer: issuerText, date: dateMatch ? parseDate(dateMatch[0]) : null, credentialUrl: url ? url[0] : undefined };
}

const CERT_ISSUER_LABEL = /^(institute|institution|issuer|issued by|organi[sz]ation|provider|offered by)\s*:\s*(.+)$/i;
const CERT_DETAIL_LABEL = /^(duration|year|date|location|country|topic|from|to|period|completed|grade|result)\s*:\s*(.*)$/i;

function labelledCertifications(cleaned: string[]): any[] {
  const items: any[] = [];
  for (const line of cleaned) {
    const issuer = line.match(CERT_ISSUER_LABEL);
    const detail = line.match(CERT_DETAIL_LABEL);
    const last = items[items.length - 1];
    if (issuer && last) {
      last.issuer = issuer[2].trim();
    } else if (detail && last) {
      const year = detail[2].match(YEAR_REGEX);
      if (year && /year|date|completed|to|period/i.test(detail[1])) last.date = parseDate(detail[2].match(SINGLE_DATE_REGEX)?.[0] || year[0]);
    } else if (!issuer && !detail) {
      const cert = lineCertification(line, []);
      if (cert) items.push(cert);
    }
  }
  return items;
}

function certificationsFromLines(lines: string[]): any[] {
  const cleaned = lines.map(l => l.trim()).filter(l => l && !headingKeyOf(l));
  if (cleaned.some(l => CERT_ISSUER_LABEL.test(l))) return labelledCertifications(cleaned);
  const dated = cleaned.some(l => SINGLE_DATE_REGEX.test(l));
  const items: any[] = [];
  if (!dated) {
    for (const line of cleaned) {
      const cert = lineCertification(line, []);
      if (cert) items.push(cert);
    }
    return items;
  }
  const consumed = new Set<number>();
  let index = 0;
  while (index < cleaned.length) {
    const line = cleaned[index];
    if (!SINGLE_DATE_REGEX.test(line)) { index++; continue; }
    const remainder = line.replace(SINGLE_DATE_REGEX, ' ').replace(/[()|,–—-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const previous = cleaned[index - 1];
    if (index > 0 && !consumed.has(index - 1) && !SINGLE_DATE_REGEX.test(previous) && !isBullet(previous) && words(remainder) <= 4) {
      const date = line.match(SINGLE_DATE_REGEX);
      items.push({ name: previous.trim().slice(0, 150), issuer: remainder || undefined, date: date ? parseDate(date[0]) : null, credentialUrl: undefined });
      consumed.add(index - 1);
      consumed.add(index);
      index++;
      continue;
    }
    const issuerLines: string[] = [];
    let next = index + 1;
    while (next < cleaned.length && !SINGLE_DATE_REGEX.test(cleaned[next]) && issuerLines.length < 3) {
      issuerLines.push(cleaned[next].replace(BULLET_REGEX, ''));
      consumed.add(next);
      next++;
    }
    consumed.add(index);
    const cert = lineCertification(line, issuerLines);
    if (cert) items.push(cert);
    index = next;
  }
  return items;
}

export function parseCertifications(segments: Segment[], trainings: any[]): any[] {
  const items: any[] = [];
  for (const segment of segments) {
    const loose: CvBlock[] = [];
    for (const block of segment.blocks) {
      if (!block.table) { loose.push(block); continue; }
      const kind = tableKind(block.table);
      if (kind !== 'training' && kind !== 'certification') continue;
      for (const rec of tableRecords(block.table).rows) {
        const cert = certificationFromRecord(rec);
        if (cert) items.push(cert);
      }
    }
    items.push(...certificationsFromLines(plainLines(loose)));
  }
  items.push(...trainings);
  const unique: any[] = [];
  for (const item of items) {
    const sameYear = (a: any, b: any) => a.date && b.date && new Date(a.date).getFullYear() === new Date(b.date).getFullYear();
    const duplicate = unique.some(u => overlap(u.name, item.name) >= 0.8 || (sameYear(u, item) && u.issuer && item.issuer && overlap(u.issuer, item.issuer) >= 0.5));
    if (!duplicate) unique.push(item);
  }
  return unique.slice(0, 20);
}

function blockWeight(block: CvBlock): number | null {
  if (block.cells && block.cells.length) return Math.max(...block.cells.map(c => c.h));
  if (block.bold !== undefined) return block.bold ? 1.2 : 1;
  return null;
}

export function parseProjects(segments: Segment[]): any[] {
  const items: any[] = [];
  for (const segment of segments) {
    let current: any = null;
    const entries = segment.blocks.filter(b => !b.table && !b.separator && b.text).map(b => ({ raw: b.text, weight: blockWeight(b) }));
    const lines = entries.map(e => e.raw);
    const explicit = lines.some(l => /^(\d{1,2}\s*[.)]\s*)?title\s*:/i.test(l) || NUMBERED_REGEX.test(l));
    const weights = entries.map(e => e.weight).filter((w): w is number => w !== null).sort((a, b) => a - b);
    const median = weights.length ? weights[Math.floor(weights.length / 2)] : 0;
    const emphasised = new Set(entries.filter(e => e.weight !== null && median > 0 && e.weight >= median * 1.08 && words(e.raw) <= 8 && !/[.:]$/.test(e.raw)).map(e => e.raw));
    const emphasisMode = !explicit && emphasised.size >= 2 && emphasised.size <= entries.length * 0.5;
    for (const raw of lines) {
      const bullet = isBullet(raw);
      const clean = raw.replace(BULLET_REGEX, '').trim();
      const urls = clean.match(URL_REGEX);
      const titled = clean.match(/^(?:\d{1,2}\s*[.)]\s*)?title\s*:\s*(.+)$/i);
      const numbered = !bullet && NUMBERED_REGEX.test(clean);
      let start = '';
      if (titled) start = titled[1];
      else if (explicit && numbered) start = clean.replace(NUMBERED_REGEX, '');
      else if (emphasisMode) start = emphasised.has(raw) && !bullet && !urls ? clean : '';
      else if (!explicit && !bullet && clean.length <= 70 && words(clean) <= 8 && !/[.:]$/.test(clean) && !urls && !LABEL_REGEX.test(clean)) start = clean;
      if (start) {
        current = { name: start.replace(URL_REGEX, '').replace(/[-–—|:(]+\s*$/, '').trim().slice(0, 150), description: '', url: urls ? urls[0].replace(/\s-\s/g, '-') : undefined };
        items.push(current);
        continue;
      }
      if (!current) continue;
      if (current.url && current.url.endsWith('-') && !urls && !/\s/.test(clean)) {
        current.url += clean;
        continue;
      }
      if (urls && !current.url) current.url = urls[0].replace(/\s-\s/g, '-');
      const text = clean.replace(/^details\s*:\s*/i, '').replace(URL_REGEX, '').trim();
      if (text) current.description = `${current.description}${current.description ? '\n' : ''}${text}`;
    }
  }
  return items.filter(i => i.name).map(i => ({ ...i, description: i.description || undefined })).slice(0, 15);
}

function summaryFrom(segments: Segment[]): string | undefined {
  const paragraph = (lines: string[]) => lines
    .filter(l => !isBullet(l) && !LABEL_REGEX.test(l.slice(0, 40)) && !EMAIL_REGEX.test(l) && !URL_REGEX.test(l))
    .join(' ');
  const summaryLines = plainLines(segments.filter(s => s.key === 'summary').flatMap(s => s.blocks));
  let text = paragraph(summaryLines);
  if (words(text) < 8) {
    const headerLines = plainLines(segments.filter(s => s.key === 'header').flatMap(s => s.blocks)).filter(l => words(l) >= 12);
    text = paragraph(headerLines);
  }
  URL_REGEX.lastIndex = 0;
  return words(text) >= 8 ? text.replace(/\s+/g, ' ').trim().slice(0, 1500) : undefined;
}

function urlsFrom(segments: Segment[]): { linkedinUrl?: string; portfolioUrl?: string } {
  const text = segments
    .filter(s => s.key !== 'projects')
    .flatMap(s => plainLines(s.blocks))
    .filter(l => !/^powered by/i.test(l))
    .join('\n');
  const explicit = (text.match(URL_REGEX) || []).map(u => u.replace(/\s-\s/g, '-').replace(/[.,;]+$/, ''));
  URL_REGEX.lastIndex = 0;
  const remainder = text.replace(new RegExp(EMAIL_REGEX.source, 'g'), ' ').replace(URL_REGEX, ' ');
  const bare = (remainder.match(BARE_DOMAIN_REGEX) || []).map(u => u.replace(/[.,;]+$/, ''));
  const urls = [...explicit, ...bare];
  const linkedin = urls.find(u => /linkedin\.com/i.test(u));
  const candidates = urls.filter(u => !/linkedin\.com|facebook\.com|twitter\.com|instagram\.com|youtube\.com|wa\.me|t\.me/i.test(u));
  const depth = (u: string) => u.replace(/^https?:\/\//i, '').split('/').filter(p => p && !p.startsWith('?')).length - 1;
  const portfolio = candidates.find(u => /github\.com|gitlab\.com|behance\.net|dribbble|portfolio/i.test(u) && depth(u) <= 1) || candidates.find(u => depth(u) <= 0);
  return { linkedinUrl: linkedin, portfolioUrl: portfolio };
}

export function parseBlocks(blocks: CvBlock[]): ParsedCv {
  const segments = splitSections(blocks);
  const of = (...keys: SectionKey[]) => segments.filter(s => keys.includes(s.key));
  const recognized = new Set(segments.filter(s => s.key !== 'header' && s.key !== 'other' && s.blocks.length).map(s => s.key));
  const result: ParsedCv = { workExperience: [], education: [], skills: [], certifications: [], languages: [], projects: [] };
  if (recognized.size < 2) return result;

  result.workExperience = of('workExperience').flatMap(s => parseExperienceSegment(s.blocks)).slice(0, 15);
  const education = parseEducation(of('education'));
  result.education = education.education;
  const gridded = (keys: SectionKey[]) => of(...keys).map(s => ({ ...s, blocks: splitGridBlocks(s.blocks) }));
  result.skills = parseSkills(gridded(['skills']));
  result.certifications = parseCertifications(of('certifications'), education.trainings);
  result.languages = parseLanguages(of('languages'));
  result.projects = parseProjects(gridded(['projects']));
  result.summary = summaryFrom(segments);
  Object.assign(result, urlsFrom(segments));
  result.headline = result.workExperience[0]?.title || undefined;
  return result;
}

export function scoreCv(cv: ParsedCv): number {
  const complete = (items: any[], keys: string[]) => items.filter(i => keys.every(k => i[k])).length;
  return complete(cv.workExperience, ['title', 'organizationName']) * 4
    + complete(cv.education, ['institution', 'degree']) * 4
    + cv.skills.length + cv.certifications.length * 2 + cv.languages.length * 2 + cv.projects.length * 2
    + (cv.summary ? 3 : 0) + (cv.linkedinUrl ? 1 : 0) + (cv.portfolioUrl ? 1 : 0);
}

export function pickBest(candidates: ParsedCv[]): ParsedCv {
  const [preferred, ...others] = candidates;
  const fallback = others.sort((a, b) => scoreCv(b) - scoreCv(a))[0];
  return fallback && scoreCv(preferred) < scoreCv(fallback) * 0.6 ? fallback : preferred;
}

export function bestScored(candidates: ParsedCv[]): ParsedCv {
  return candidates.reduce((best, candidate) => (scoreCv(candidate) > scoreCv(best) ? candidate : best));
}
