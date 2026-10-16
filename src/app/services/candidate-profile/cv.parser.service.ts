import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

export interface ParsedCv {
  headline?: string;
  summary?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  workExperience: any[];
  education: any[];
  skills: any[];
  certifications: any[];
  languages: any[];
  projects: any[];
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DATE_PART = '(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?,?\\s+\\d{4}|\\d{1,2}\\s*[/.-]\\s*\\d{4}|\\d{4})';
const RANGE_REGEX = new RegExp(`(${DATE_PART})\\s*(?:-|–|—|to)\\s*(${DATE_PART}|present|current|now|ongoing|till date)`, 'i');
const SINGLE_DATE_REGEX = new RegExp(DATE_PART, 'i');
const BULLET_REGEX = /^\s*[•●▪■◦○*\-–—·➢➤✓>]+\s*/;
const URL_REGEX = /(?:https?:\/\/|www\.|linkedin\.com\/)[^\s)>,;]+/gi;

const SECTION_HEADINGS: { [key: string]: RegExp } = {
  summary: /^(professional\s+|career\s+)?(summary|profile|objective|career objective|about me|about)$/i,
  workExperience: /^((professional|work|employment|job)\s+)?(experience|history)(\s+history)?$|^employment$|^work history$/i,
  education: /^(education|academic( background| qualifications?| profile)?|educational (background|qualifications?)|qualifications?)$/i,
  skills: /^((technical|key|core|professional|it)\s+)?(skills?|competenc(y|ies)|expertise|technologies)(\s*(&|and)\s*\w+)?$/i,
  certifications: /^(certifications?|certificates?|licen[sc]es?( (&|and) certifications?)?|training|courses|trainings?( (&|and) certifications?)?)$/i,
  languages: /^(languages?|language proficiency)$/i,
  projects: /^((personal|academic|key|major)\s+)?projects?$/i,
  other: /^(references?|interests?|hobbies|declaration|personal (details|information)|awards?( (&|and) honou?rs)?|achievements?|publications?|activities|extra[- ]?curricular.*|volunteer.*)$/i
};

const JOB_TITLE_REGEX = /\b(engineer|developer|manager|officer|executive|analyst|designer|consultant|lead|director|assistant|intern|administrator|architect|specialist|coordinator|supervisor|teacher|lecturer|accountant|head|associate|trainee|programmer|tester|technician|representative|president)\b/i;
const INSTITUTION_REGEX = /\b(university|college|institute|school|academy|polytechnic|madrasa|madrasah|board)\b/i;
const GRADE_REGEX = /\b(?:cgpa|gpa|grade|result|division|class)\b[^\d\n]{0,12}([\d.]+(?:\s*(?:\/|out of)\s*[\d.]+)?|first class|second class|first division|second division)/i;

const LANGUAGES = ['Bangla', 'English', 'Hindi', 'Urdu', 'Arabic', 'French', 'German', 'Spanish', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Portuguese', 'Italian', 'Turkish', 'Malay'];
const DEGREES = ['PSC', 'JSC', 'SSC', 'O-Level', 'HSC', 'A-Level', 'Dakhil', 'Alim', 'Diploma', 'Bachelor', 'Honors', 'BBA', 'BSc', 'BA', 'BSS', 'BCom', 'BSc in Engineering', 'MBBS', 'LLB', 'Master', 'MBA', 'MSc', 'MA', 'MSS', 'MCom', 'MPhil', 'PhD'];
const FIELDS = ['Computer Science and Engineering', 'Information Technology', 'Software Engineering', 'Electrical and Electronic Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Business Administration', 'Business Studies', 'Accounting', 'Finance', 'Marketing', 'Management', 'Economics', 'Banking and Insurance', 'Human Resource Management', 'English', 'Bangla', 'Law', 'Mathematics', 'Statistics', 'Physics', 'Chemistry', 'Biology', 'Pharmacy', 'Medicine', 'Sociology', 'Political Science', 'Public Administration', 'Psychology', 'Education', 'Architecture', 'Agriculture', 'Science', 'Commerce', 'Humanities'];

@Injectable({ providedIn: 'root' })
export class CvParserService {
  static readonly MAX_BYTES = 5 * 1024 * 1024;

  async parseFile(file: File): Promise<ParsedCv> {
    const name = file.name.toLowerCase();
    let text: string;
    if (name.endsWith('.pdf')) {
      text = await this.extractPdfText(file);
    } else if (name.endsWith('.docx')) {
      text = await this.extractDocxText(file);
    } else {
      throw new Error('unsupported');
    }
    if (!text.trim()) {
      throw new Error('empty');
    }
    return this.parseText(text);
  }

  private async extractPdfText(file: File): Promise<string> {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';
    const pdf = await (pdfjsLib as any).getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const lines: string[] = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const rows: { y: number; parts: { x: number; str: string }[] }[] = [];
      for (const item of content.items as any[]) {
        if (!item.str || !item.str.trim()) continue;
        const y = item.transform[5];
        const row = rows.find(r => Math.abs(r.y - y) < 3);
        if (row) row.parts.push({ x: item.transform[4], str: item.str });
        else rows.push({ y, parts: [{ x: item.transform[4], str: item.str }] });
      }
      rows.sort((a, b) => b.y - a.y);
      rows.forEach(r => lines.push(r.parts.sort((a, b) => a.x - b.x).map(p => p.str).join(' ')));
      lines.push('');
    }
    return lines.join('\n');
  }

  private async extractDocxText(file: File): Promise<string> {
    const mammoth = await import('mammoth/mammoth.browser.min.js');
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }

  parseText(text: string): ParsedCv {
    const lines = text.replace(/\r/g, '').replace(/ /g, ' ').split('\n').map(l => l.replace(/\s+/g, ' ').trim());
    const sections = this.splitSections(lines);
    const result: ParsedCv = { workExperience: [], education: [], skills: [], certifications: [], languages: [], projects: [] };

    const urls = (text.match(URL_REGEX) || []).map(u => u.replace(/[.]+$/, ''));
    result.linkedinUrl = urls.find(u => /linkedin\.com/i.test(u));
    result.portfolioUrl = urls.find(u => /(github|gitlab|behance|portfolio)/i.test(u) || !/linkedin\.com/i.test(u));
    if (result.portfolioUrl && result.portfolioUrl === result.linkedinUrl) result.portfolioUrl = undefined;

    result.summary = (sections['summary'] || []).filter(l => l).join(' ').slice(0, 1500) || undefined;
    result.workExperience = this.parseExperience(sections['workExperience'] || []);
    result.education = this.parseEducation(sections['education'] || []);
    result.skills = this.parseSkills(sections['skills'] || []);
    result.certifications = this.parseCertifications(sections['certifications'] || []);
    result.languages = this.parseLanguages(sections['languages'] || []);
    result.projects = this.parseProjects(sections['projects'] || []);
    result.headline = result.workExperience[0]?.title;
    return result;
  }

  private splitSections(lines: string[]): { [key: string]: string[] } {
    const sections: { [key: string]: string[] } = {};
    let current = 'header';
    for (const line of lines) {
      const clean = line.replace(/[:：]+$/, '').replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').trim();
      const key = clean.length > 0 && clean.length < 45
        ? Object.keys(SECTION_HEADINGS).find(k => SECTION_HEADINGS[k].test(clean))
        : undefined;
      if (key) {
        current = key;
        sections[current] = sections[current] || [];
      } else {
        (sections[current] = sections[current] || []).push(line);
      }
    }
    return sections;
  }

  private parseDate(value: string): Date | null {
    const v = value.trim().toLowerCase();
    if (/^(present|current|now|ongoing|till date)$/.test(v)) return null;
    const month = MONTHS.findIndex(m => v.startsWith(m));
    const year = v.match(/\d{4}/);
    if (!year) return null;
    if (month >= 0) return new Date(+year[0], month, 1);
    const numeric = v.match(/^(\d{1,2})\s*[/.-]\s*\d{4}$/);
    if (numeric && +numeric[1] >= 1 && +numeric[1] <= 12) return new Date(+year[0], +numeric[1] - 1, 1);
    return new Date(+year[0], 0, 1);
  }

  private parseRange(line: string): { start: Date | null; end: Date | null; current: boolean; rest: string } | null {
    const match = line.match(RANGE_REGEX);
    if (!match) return null;
    const isOpen = /^(present|current|now|ongoing|till date)$/i.test(match[2].trim());
    return {
      start: this.parseDate(match[1]),
      end: isOpen ? null : this.parseDate(match[2]),
      current: isOpen,
      rest: line.replace(match[0], ' ').replace(/[()|,–—-]+\s*$/g, '').replace(/^\s*[()|,–—-]+/g, '').replace(/\s+/g, ' ').trim()
    };
  }

  private isBullet(line: string): boolean {
    return BULLET_REGEX.test(line);
  }

  private parseExperience(lines: string[]): any[] {
    const items: any[] = [];
    let current: any = null;
    let pending: string[] = [];
    const flushPending = () => { pending = []; };

    lines.forEach((line, index) => {
      if (!line) {
        return;
      }
      const range = this.parseRange(line);
      if (range && !this.isBullet(line)) {
        const header = [...pending.slice(-2), range.rest].filter(p => p);
        if (current && pending.length) {
          current.description = current.description.trim() || undefined;
        }
        current = { ...this.splitTitleAndOrg(header), startDate: range.start, endDate: range.end, current: range.current, description: '' };
        items.push(current);
        flushPending();
        return;
      }
      const next = lines.slice(index + 1).find(l => l);
      const nextIsRange = !!next && !!this.parseRange(next) && !this.isBullet(next);
      if (!this.isBullet(line) && line.length < 90 && (nextIsRange || (!current)) ) {
        pending.push(line);
        if (nextIsRange && current) {
          current.description = (current.description || '').trim() || undefined;
        }
        return;
      }
      if (current) {
        current.description = `${current.description || ''}${current.description ? '\n' : ''}${line.replace(BULLET_REGEX, '')}`;
      }
    });
    items.forEach(i => { i.description = i.description ? String(i.description).trim() || undefined : undefined; });
    return items.filter(i => i.title || i.organizationName).slice(0, 15);
  }

  private splitTitleAndOrg(parts: string[]): { title: string; organizationName: string; location?: string } {
    const pieces = parts.flatMap(p => p.split(/\s+(?:at|@)\s+|\s*[|•]\s*|\s+[-–—]\s+/i)).map(p => p.trim()).filter(p => p);
    const title = pieces.find(p => JOB_TITLE_REGEX.test(p)) || pieces[0] || '';
    const org = pieces.find(p => p !== title) || '';
    return { title: title.slice(0, 150), organizationName: org.slice(0, 150) };
  }

  private parseEducation(lines: string[]): any[] {
    const blocks = this.splitBlocks(lines, l => INSTITUTION_REGEX.test(l) || !!this.parseRange(l), b => b.some(l => INSTITUTION_REGEX.test(l)) && b.some(l => !!this.parseRange(l)));
    const items: any[] = [];
    for (const block of blocks) {
      const joined = block.join(' ');
      const range = block.map(l => this.parseRange(l)).find(r => r);
      const single = !range ? joined.match(SINGLE_DATE_REGEX) : null;
      const degree = [...DEGREES].sort((a, b) => b.length - a.length)
        .find(d => new RegExp(`(^|[^A-Za-z])${d.replace(/[-.]/g, '\\$&')}(?![A-Za-z])`, 'i').test(joined)) || '';
      const field = [...FIELDS].sort((a, b) => b.length - a.length).find(f => new RegExp(f, 'i').test(joined));
      const institution = block.find(l => INSTITUTION_REGEX.test(l));
      const grade = joined.match(GRADE_REGEX);
      if (!institution && !degree) continue;
      items.push({
        institution: (institution ? institution.replace(RANGE_REGEX, '').replace(/[,|–—-]\s*$/, '').trim() : '').slice(0, 150),
        degree,
        fieldOfStudy: field,
        startDate: range?.start || null,
        endDate: range ? range.end : (single ? this.parseDate(single[0]) : null),
        current: range?.current || false,
        grade: grade ? grade[1].trim() : undefined
      });
    }
    return items.slice(0, 10);
  }

  private splitBlocks(lines: string[], isStart: (line: string) => boolean, isComplete: (block: string[]) => boolean): string[][] {
    const blocks: string[][] = [];
    let block: string[] = [];
    for (const line of lines) {
      if (!line) {
        if (block.length) { blocks.push(block); block = []; }
        continue;
      }
      if (block.length && isStart(line) && isComplete(block) && !this.isBullet(line)) {
        blocks.push(block);
        block = [];
      }
      block.push(line);
    }
    if (block.length) blocks.push(block);
    return blocks;
  }

  private parseSkills(lines: string[]): any[] {
    const seen = new Set<string>();
    const result: any[] = [];
    for (const raw of lines) {
      const line = raw.replace(BULLET_REGEX, '').replace(/^[\w &/+#.-]{2,30}:\s*/, '');
      for (const part of line.split(/[,;|•●▪·]|\s{3,}/)) {
        const name = part.replace(BULLET_REGEX, '').trim();
        if (name.length < 2 || name.length > 40 || name.split(' ').length > 5) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ name });
      }
    }
    return result.slice(0, 40);
  }

  private parseLanguages(lines: string[]): any[] {
    const result: any[] = [];
    const joined = lines.join(' ');
    for (const language of LANGUAGES) {
      const match = joined.match(new RegExp(`\\b${language}\\b\\s*(?:[-:(–]\\s*)?([A-Za-z ]{0,20})`, 'i'));
      if (!match) continue;
      const hint = match[1].toLowerCase();
      const proficiency = /native|mother/.test(hint) ? 'Native'
        : /fluent|advanced|proficient|excellent/.test(hint) ? 'Fluent'
        : /conversational|intermediate|good|medium/.test(hint) ? 'Conversational'
        : /basic|beginner|elementary|fair/.test(hint) ? 'Basic' : undefined;
      result.push({ name: language, proficiency });
    }
    return result;
  }

  private parseCertifications(lines: string[]): any[] {
    return lines.filter(l => l).map(l => {
      const date = l.match(SINGLE_DATE_REGEX);
      const url = l.match(URL_REGEX);
      const text = l.replace(BULLET_REGEX, '').replace(URL_REGEX, '').replace(SINGLE_DATE_REGEX, '').replace(/[()|,–—-]+\s*$/g, '').trim();
      const [name, issuer] = text.split(/\s+(?:by|from|[-–—|])\s+|,\s+/i);
      return { name: (name || '').slice(0, 150), issuer: issuer?.trim(), date: date ? this.parseDate(date[0]) : null, credentialUrl: url ? url[0] : undefined };
    }).filter(c => c.name.length > 2).slice(0, 20);
  }

  private parseProjects(lines: string[]): any[] {
    const items: any[] = [];
    let current: any = null;
    for (const line of lines) {
      if (!line) continue;
      if (!this.isBullet(line) && line.length < 80 && !/[.]$/.test(line)) {
        const url = line.match(URL_REGEX);
        current = { name: line.replace(URL_REGEX, '').replace(/[-–—|:(]+\s*$/, '').trim(), description: '', url: url ? url[0] : undefined };
        items.push(current);
      } else if (current) {
        const url = line.match(URL_REGEX);
        if (url && !current.url) current.url = url[0];
        current.description = `${current.description}${current.description ? '\n' : ''}${line.replace(BULLET_REGEX, '')}`;
      }
    }
    return items.filter(i => i.name).map(i => ({ ...i, description: i.description || undefined })).slice(0, 15);
  }
}
