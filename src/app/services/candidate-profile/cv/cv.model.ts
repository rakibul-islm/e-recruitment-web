export interface CvCell {
  text: string;
  x: number;
  x2: number;
  y: number;
  h: number;
}

export interface CvBlock {
  text: string;
  parts: string[];
  cells?: CvCell[];
  tabs?: number[];
  table?: string[][];
  bold?: boolean;
  separator?: boolean;
}

export interface PdfItem {
  str: string;
  x: number;
  x2: number;
  y: number;
  h: number;
}

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

export type SectionKey = 'header' | 'summary' | 'workExperience' | 'education' | 'skills' | 'certifications' | 'languages' | 'projects' | 'other';

export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const MONTH_NAME = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*';
const MONTH_PART = `${MONTH_NAME}\\.?,?\\s*(?:\\d{1,2}(?:st|nd|rd|th)?,?\\s*)?\\d{4}|${MONTH_NAME}\\.?\\s*['’]\\d{2}`;
export const DATE_PART = `(?:${MONTH_PART}|\\d{1,2}\\s*[/.-]\\s*\\d{4}|\\d{4})`;
export const OPEN_END = 'present|current|continuing|continue|now|ongoing|till date|to date|till now|today';
export const RANGE_REGEX = new RegExp(`(${DATE_PART})\\s*(?:(?:-|–|—|to|till|until)\\s*(${DATE_PART}|${OPEN_END})|\\s(${MONTH_PART}|${OPEN_END}))`, 'i');
export const SINGLE_DATE_REGEX = new RegExp(DATE_PART, 'i');
export const YEAR_REGEX = /\b(?:19|20)\d{2}\b/;
export const BULLET_REGEX = /^\s*(?:[•●▪■◦○*·➢➤✓❖→►▶>«»‣⁃]+|[-–—]\s)\s*/;
export const NUMBERED_REGEX = /^\s*\d{1,2}\s*[.)]\s+/;
export const URL_REGEX = /(?:https?:\/\/|www\.|linkedin\.com\/|github\.com\/|gitlab\.com\/|behance\.net\/)[^\s)>,;]+(?:\s-\s[^\s)>,;]+)*/gi;
export const EMAIL_REGEX = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

export const SECTION_VOCAB: { [key: string]: string[] } = {
  summary: ['summary', 'professionalsummary', 'careersummary', 'profile', 'professionalprofile', 'objective', 'careerobjective', 'about', 'aboutme', 'personalstatement', 'executivesummary', 'profilesummary', 'summaryofqualifications'],
  workExperience: ['experience', 'workexperience', 'professionalexperience', 'employmenthistory', 'workhistory', 'employment', 'profession', 'careerhistory', 'jobexperience', 'employmentrecord', 'experiences', 'relevantexperience', 'employmentdetails', 'workingexperience', 'internship', 'internships', 'internshipexperience', 'professionalbackground', 'careerexperience', 'industrialattachment', 'teachingexperience', 'academicexperience', 'bankingexperience', 'academicpositions', 'positionsheld', 'positions', 'professionalpositions', 'facultypositions', 'teachingpositions'],
  education: ['education', 'academicqualification', 'academicqualifications', 'educationalqualification', 'educationalqualifications', 'academicbackground', 'academicprofile', 'qualifications', 'educationalbackground', 'academics', 'academicrecord', 'educationalprofile', 'educationdetails'],
  skills: ['skills', 'skill', 'technicalskills', 'keyskills', 'coreskills', 'professionalskills', 'personalskill', 'personalskills', 'otherskills', 'othersskill', 'othersskills', 'otherskill', 'specialization', 'fieldsofspecialization', 'technologies', 'competencies', 'expertise', 'technicalexpertise', 'computerskills', 'itskills', 'skillsandexpertise', 'techskills', 'technicalproficiency', 'corecompetencies', 'keycompetencies', 'toolsandtechnologies', 'toolsandskills', 'professionalcompetencies'],
  certifications: ['certifications', 'certification', 'certificates', 'licenses', 'licensesandcertifications', 'licensesandcertificates', 'courses', 'professionalqualification', 'professionalqualifications', 'trainingsummary', 'training', 'trainings', 'trainingandcertifications', 'workshops', 'professionalcertifications', 'coursesandcertifications', 'trainingandworkshops', 'professionaltraining', 'trainingandcourses', 'coursesandtraining', 'trainingcourses', 'trainingprograms', 'achievementsandcertifications'],
  languages: ['languages', 'language', 'languageproficiency', 'languageskill', 'languageskills', 'languagecompetency', 'spokenlanguages', 'languagesspoken', 'languageknowledge'],
  projects: ['projects', 'project', 'personalprojects', 'academicprojects', 'keyprojects', 'majorprojects', 'projectexperience', 'selectedprojects', 'projectsworkedon', 'projectdetails'],
  other: ['references', 'reference', 'referees', 'interests', 'hobbies', 'hobby', 'declaration', 'personalinformation', 'personalinfo', 'personaldetails', 'familybackground', 'awards', 'awardsandhonors', 'awardsandhonours', 'achievements', 'keyachievements', 'majorachievements', 'professionalachievements', 'awardsandachievements', 'accomplishments', 'publications', 'activities', 'extracurricularactivities', 'extracurricular', 'volunteer', 'volunteering', 'volunteerexperience', 'careerandapplicationinformation', 'selfappraisal', 'innovativeactivities', 'specialqualification', 'mytime', 'contact', 'contactinformation', 'contactdetails', 'presentaddress', 'permanentaddress', 'mailingaddress', 'address', 'strengths', 'keystrengths', 'personaldata', 'bio', 'biodata', 'personalprofile', 'otherinformation', 'additionalinformation', 'socialactivities', 'honorsandawards']
};

export const HEADER_TOKENS = new Set(['examination', 'issuer','provider', 'issued', 'authority', 'position','employer', 'tenure', 'exam','title', 'group', 'major', 'concentration', 'subject', 'institute', 'institution', 'board', 'university', 'result', 'results', 'grade', 'cgpa', 'gpa', 'pass', 'passing', 'year', 'of', 'duration', 'training', 'topic', 'country', 'location', 'certification', 'from', 'to', 'language', 'reading', 'writing', 'speaking', 'degree', 'level', 'name', 'organization', 'company', 'designation', 'period', 'date', 'marks', 'class', 'division', 'and', 'department', 'course', 'session', 'semester', 'proficiency', 'qualification', 'education', 'listening', 'no', 'sl', 'serial', 'the', 'in', 'field', 'study', 'program', 'programme', 'type']);
export const STRONG_HEADER_TOKENS = new Set(['issuer', 'designation','organization', 'company', 'position', 'exam','institute', 'institution', 'result', 'year', 'training', 'topic', 'certification', 'language', 'reading', 'speaking', 'degree', 'board', 'cgpa', 'gpa', 'duration', 'major', 'concentration', 'qualification']);

export const JOB_TITLE_REGEX = /\b(engineer|developer|manager|officer|executive|analyst|designer|consultant|lead|director|assistant|intern|internee|administrator|architect|specialist|coordinator|supervisor|teacher|lecturer|professor|instructor|accountant|head|associate|trainee|programmer|tester|technician|representative|president|trainer|clerk|secretary|nurse|doctor|pharmacist|auditor|banker|agent|advisor|adviser|scientist|researcher|founder|owner|operator|driver|salesman|marketer|writer|editor|principal|chief|cto|ceo|cfo|coo|vp|sde|qa|devops|freelancer|tutor|controller|treasurer|registrar|dean|physician|surgeon|planner|buyer|merchandiser|pilot|chef|cashier|teller|counselor|counsellor|librarian|therapist|dentist|mechanic|electrician|receptionist|translator|interpreter|producer|reporter|journalist|photographer|animator|strategist|recruiter|underwriter|broker|dispatcher|foreman|superintendent|inspector|paralegal|attorney|lawyer|advocate|barrister|surveyor|estimator|technologist)\b/i;
export const ORG_REGEX = /\b(ltd|limited|inc|incorporated|llc|corp|corporation|company|co|bank|group|solutions?|technologies|technology|systems|software|services|industries|enterprise|enterprises|associates|institute|university|college|school|hospital|ngo|foundation|agency|authority|ministry|department|laboratories|labs|studio|consultancy|consulting|telecom|pharma|pharmaceuticals|textile|textiles|dot com|\.com|it)\b/i;
export const INSTITUTION_REGEX = /\b(university|college|institute|school|academy|polytechnic|madrasa|madrasah|madrasha|vidyalaya|board|inst\.?)\b/i;
export const LOCATION_REGEX = /\b(dhaka|chittagong|chattogram|chandpur|sylhet|khulna|rajshahi|barisal|rangpur|mymensingh|comilla|cumilla|gazipur|narayanganj|bangladesh|road|rd\.?|street|st\.?|avenue|ave\.?|sector|block|area|floor|mirpur|gulshan|banani|uttara|dhanmondi|motijheel|badda|mohakhali|tejgaon|farmgate|zigatola|keraniganj|village|vill|p\/o|p\/s|district|upazila|upazilla|post office)\b/i;

export const LANGUAGE_ALIASES: { [key: string]: string } = {
  bangla: 'Bangla', bengali: 'Bangla', bangali: 'Bangla', english: 'English', hindi: 'Hindi', urdu: 'Urdu', arabic: 'Arabic', arabian: 'Arabic',
  french: 'French', german: 'German', spanish: 'Spanish', chinese: 'Chinese', mandarin: 'Chinese', japanese: 'Japanese', korean: 'Korean', russian: 'Russian',
  portuguese: 'Portuguese', italian: 'Italian', turkish: 'Turkish', malay: 'Malay', persian: 'Persian', tamil: 'Tamil', nepali: 'Nepali', sanskrit: 'Sanskrit'
};

export const DEGREE_CANON: { re: RegExp; name: string }[] = [
  { re: /^\(?\s*s\.?\s*s\.?\s*c\.?\s*\)?\b|secondary school certificate|\bssc\b|dakhil|o-?\s?level/i, name: 'SSC' },
  { re: /^\(?\s*h\.?\s*s\.?\s*c\.?\s*\)?\b|higher secondary certificate|\bhsc\b|alim\b|a-?\s?level|intermediate/i, name: 'HSC' },
  { re: /\bm\.?\s*b\.?\s*b\.?\s*s\b/i, name: 'MBBS' },
  { re: /\bm\.?\s?phil\b/i, name: 'MPhil' },
  { re: /\bph\.?\s?d\b|doctor of philosophy/i, name: 'PhD' },
  { re: /\bm\.?\s*b\.?\s*a\b|master of business administration/i, name: 'MBA' },
  { re: /\bm\.?\s*sc\b|master of science|\bmsc\b/i, name: 'MSc' },
  { re: /\bm\.?\s*com\b|master of commerce/i, name: 'MCom' },
  { re: /\bm\.?\s*s\.?\s*s\b|master of social science/i, name: 'MSS' },
  { re: /\bm\.?\s*a\b(?!\w)|master of arts/i, name: 'MA' },
  { re: /\bb\.?\s*b\.?\s*a\b|bachelor of business administration/i, name: 'BBA' },
  { re: /\bb\.?\s*sc\b|bachelor of science|\bbsc\b|\bb\.?\s*tech\b|bachelor of engineering|\bb\.?\s*e\b/i, name: 'BSc' },
  { re: /\bb\.?\s*com\b|bachelor of commerce/i, name: 'BCom' },
  { re: /\bb\.?\s*s\.?\s*s\b|bachelor of social science/i, name: 'BSS' },
  { re: /\bb\.?\s*a\b(?!\w)|bachelor of arts/i, name: 'BA' },
  { re: /\bl\.?\s*l\.?\s*b\b|bachelor of laws?/i, name: 'LLB' },
  { re: /\bpost\s*graduat(?:e|ion)\b|\bpgd\b/i, name: 'Post Graduation' },
  { re: /\bacca\b/i, name: 'ACCA' },
  { re: /\bchartered accountan(?:t|cy)\b|\baca\b|\bfca\b/i, name: 'ACA' },
  { re: /\bcma\b|\bcost and management accountan(?:t|cy)\b/i, name: 'CMA' },
  { re: /\bcpa\b|\bcertified public accountant\b/i, name: 'CPA' },
  { re: /\bdiploma\b/i, name: 'Diploma' },
  { re: /\bmasters?\b/i, name: 'Master' },
  { re: /\bbachelors?\b|\bhonou?rs\b/i, name: 'Bachelor' }
];

export const FIELDS = ['Computer Science and Engineering', 'Computer Science & Engineering', 'Computer Science', 'Information Technology', 'Software Engineering', 'Electrical and Electronic Engineering', 'Electrical & Electronic Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Business Administration', 'Business Studies', 'Accounting', 'Finance', 'Marketing', 'Management', 'Economics', 'Banking and Insurance', 'Human Resource Management', 'English', 'Bangla', 'Law', 'Mathematics', 'Statistics', 'Physics', 'Chemistry', 'Biology', 'Pharmacy', 'Medicine', 'Sociology', 'Political Science', 'Public Administration', 'Psychology', 'Education', 'Architecture', 'Agriculture', 'Science', 'Commerce', 'Humanities', 'Arts'];

export function squash(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, '');
}

export function editDistanceAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

export function headingKeyOf(text: string): SectionKey | null {
  const spaced = text.replace(/\([^)]*\)/g, ' ').replace(/[:：]+\s*$/, '').trim();
  const tokens = spaced.split(/\s+/).filter(t => t);
  const letterSpaced = tokens.length >= 4 && tokens.filter(t => t.length === 1).length >= tokens.length * 0.8;
  const stripped = spaced;
  if (!stripped || stripped.length > (letterSpaced ? 80 : 48) || tokens.length > (letterSpaced ? 40 : 6) || /[.,;]$/.test(stripped) || /\d/.test(stripped)) return null;
  const squashed = squash(stripped);
  if (squashed.length < 3) return null;
  const spelledOut = squash(stripped.replace(/&/g, ' and '));
  for (const key of Object.keys(SECTION_VOCAB)) {
    for (const word of SECTION_VOCAB[key]) {
      if (word === squashed || word === spelledOut) return key as SectionKey;
    }
  }
  if (squashed.length >= 7 && stripped === stripped.toUpperCase()) {
    for (const key of Object.keys(SECTION_VOCAB)) {
      for (const word of SECTION_VOCAB[key]) {
        if (word.length >= 7 && editDistanceAtMostOne(word, squashed)) return key as SectionKey;
      }
    }
  }
  return capsHeadingKey(stripped) || titleHeadingKey(stripped);
}

const TITLE_LAST_WORDS: { [word: string]: SectionKey } = {
  experience: 'workExperience', employment: 'workExperience', education: 'education', qualification: 'education', qualifications: 'education',
  skills: 'skills', competencies: 'skills', projects: 'projects', summary: 'summary', profile: 'summary', objective: 'summary',
  certifications: 'certifications', certificates: 'certifications', trainings: 'certifications', courses: 'certifications', languages: 'languages'
};

function titleHeadingKey(stripped: string): SectionKey | null {
  const words = stripped.split(/\s+/);
  if (words.length < 2 || words.length > 3 || !words.every(w => /^[A-Z][a-z&]*$/.test(w) || w === '&')) return null;
  return TITLE_LAST_WORDS[words[words.length - 1].toLowerCase()] || null;
}

const CAPS_KEYWORDS: { re: RegExp; key: SectionKey }[] = [
  { re: /\bPROJECTS?\b/, key: 'projects' },
  { re: /\b(EXPERIENCE|EMPLOYMENT)\b/, key: 'workExperience' },
  { re: /\b(EDUCATION|ACADEMIC|ACADEMICS)\b/, key: 'education' },
  { re: /\b(SKILLS|EXPERTISE|COMPETENCIES)\b/, key: 'skills' },
  { re: /\b(CERTIFICATIONS?|CERTIFICATES|COURSES|LICENSES?|TRAININGS?)\b/, key: 'certifications' },
  { re: /\bLANGUAGES\b/, key: 'languages' },
  { re: /\b(SUMMARY|PROFILE|OBJECTIVE)\b/, key: 'summary' }
];

function capsHeadingKey(stripped: string): SectionKey | null {
  if (stripped !== stripped.toUpperCase() || stripped.split(/\s+/).length > 4) return null;
  const hit = CAPS_KEYWORDS.find(k => k.re.test(stripped));
  return hit ? hit.key : null;
}

export function inlineHeadingOf(text: string): { key: SectionKey; rest: string } | null {
  const match = text.match(/^([A-Za-z][A-Za-z &/]{2,34}?)\s*[:：]\s*(\S.*)$/);
  if (!match) return null;
  const key = headingKeyOf(match[1]);
  if (!key || key === 'other' || key === 'workExperience' || key === 'education') return null;
  return { key, rest: match[2].trim() };
}

export function normalizeText(raw: string): string {
  return raw
    .replace(/[   ]/g, ' ')
    .replace(/[​‌‍﻿]/g, '')
    .replace(/\b(1\s?9|2\s?0)\s?(\d)\s?(\d)\b/g, '$1$2$3')
    .replace(/\b(\d)\s*\.\s+(\d{1,2})\b/g, '$1.$2')
    .replace(/\b(\d)\s+\.(\d{1,2})\b/g, '$1.$2')
    .replace(/(\S)\s+@(?=\w)/g, '$1@')
    .replace(/@\s+(?=[\w-]+\s*\.)/g, '@')
    .replace(/(@[\w-]+)\s+\.\s*(?=\w)/g, '$1.')
    .replace(/(^|\s)[=~_]+(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalDegree(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  for (const entry of DEGREE_CANON) {
    if (entry.re.test(cleaned)) return entry.name;
  }
  const abbreviation = cleaned.match(/^\(?([BM]\.?(?:[A-Z]{2,4}|[A-Z][a-z]{1,4})|DVM|BDS)\b/);
  if (abbreviation) return abbreviation[1].replace('.', '');
  return cleaned;
}
