import { hasColumns, htmlToBlocks, pdfPagesToBlocks, routeTabColumns, splitGridBlocks, textToBlocks } from './cv.layout';
import { PdfItem, headingKeyOf, normalizeText } from './cv.model';
import { ocrWordsToItems } from './cv.ocr';
import { bestScored, parseBlocks, pickBest } from './cv.parser';
import { skillTermsIn } from './cv.skills';

const item = (str: string, x: number, y: number, width = str.length * 5.5, h = 11): PdfItem => ({ str, x, x2: x + width, y, h });

const parseText = (text: string) => parseBlocks(textToBlocks(text));
const year = (date: any) => (date ? new Date(date).getFullYear() : null);

describe('CV parsing', () => {
  describe('headings', () => {
    it('recognises plain, ampersand, letter-spaced and title-case headings', () => {
      expect(headingKeyOf('Work Experience')).toBe('workExperience');
      expect(headingKeyOf('Licenses & Certifications')).toBe('certifications');
      expect(headingKeyOf('W O R K  E X P E R I E N C E')).toBe('workExperience');
      expect(headingKeyOf('Teaching Experience')).toBe('workExperience');
      expect(headingKeyOf('EDUCATION & TRAINING')).toBe('education');
    });

    it('tolerates a typo in an upper-case heading but not in ordinary words', () => {
      expect(headingKeyOf('SAMMARY')).toBe('summary');
      expect(headingKeyOf('Academic')).toBeNull();
    });

    it('does not treat a sentence or a label value as a heading', () => {
      expect(headingKeyOf('Experienced engineer with a record of delivery.')).toBeNull();
      expect(headingKeyOf('Total Year of Experience : 1.3 yrs')).toBeNull();
    });
  });

  describe('text normalisation', () => {
    it('repairs split years, decimals and e-mail addresses', () => {
      expect(normalizeText('Passing year 20 21 and 201 3')).toBe('Passing year 2021 and 2013');
      expect(normalizeText('CGPA: 2 . 71 out of 4')).toBe('CGPA: 2.71 out of 4');
      expect(normalizeText('name @gmail .com')).toBe('name@gmail.com');
    });
  });

  describe('experience', () => {
    it('reads title, company and date range on separate lines', () => {
      const cv = parseText([
        'Work Experience',
        'Senior Software Engineer',
        'Acme Technologies Ltd, Dhaka',
        'Jan 2021 - Present',
        '• Built services',
        'Software Engineer | Beta Soft',
        'Jun 2018 - Dec 2020',
        'Education',
        'University of Dhaka'
      ].join('\n'));
      expect(cv.workExperience.length).toBe(2);
      expect(cv.workExperience[0].title).toBe('Senior Software Engineer');
      expect(cv.workExperience[0].organizationName).toBe('Acme Technologies Ltd');
      expect(cv.workExperience[0].current).toBeTrue();
      expect(year(cv.workExperience[1].startDate)).toBe(2018);
      expect(cv.workExperience[1].organizationName).toBe('Beta Soft');
    });

    it('splits "Title, Company" lines that carry a right-aligned date', () => {
      const cv = parseText(['Experience', 'Lead Engineer, bKash Limited          Jan 2020 - Present', 'Education', 'University of Dhaka, 2015'].join('\n'));
      expect(cv.workExperience[0].title).toBe('Lead Engineer');
      expect(cv.workExperience[0].organizationName).toBe('bKash Limited');
    });

    it('understands abbreviated and numeric month-year dates', () => {
      const cv = parseText(['Experience', 'Android Developer - Shohoz Limited    Jan\'20 – Present', 'Junior Android Developer - Nascenia IT    01/2018 – 12/2019', 'Skills', 'Kotlin'].join('\n'));
      expect(cv.workExperience.length).toBe(2);
      expect(year(cv.workExperience[0].startDate)).toBe(2020);
      expect(cv.workExperience[0].current).toBeTrue();
      expect(year(cv.workExperience[1].endDate)).toBe(2019);
    });

    it('takes the period from a "Period:" label and keeps responsibilities out of the title', () => {
      const cv = parseText(['Experience', 'Financial Controller - Summit Communications Ltd.', 'Period: April 2018 - Present', 'Responsibilities:', 'Own statutory reporting.', 'Education', 'BBA, University of Dhaka, 2010'].join('\n'));
      expect(cv.workExperience.length).toBe(1);
      expect(cv.workExperience[0].title).toBe('Financial Controller');
      expect(cv.workExperience[0].organizationName).toBe('Summit Communications Ltd.');
      expect(cv.workExperience[0].current).toBeTrue();
    });

    it('starts a new entry when a company line precedes a title and date line', () => {
      const cv = parseText(['Experience', 'Ha-Meem Group — Dhaka', 'Operations Manager          2018 – Present', '• Oversee planning', 'DBL Group — Dhaka', 'Production Manager          2012 – 2018', 'Education', 'BSc, Bangladesh University of Textiles, 2012'].join('\n'));
      expect(cv.workExperience.map(e => e.organizationName)).toEqual(['Ha-Meem Group', 'DBL Group']);
      expect(cv.workExperience.map(e => e.title)).toEqual(['Operations Manager', 'Production Manager']);
    });

    it('reads bulleted one-line entries', () => {
      const cv = parseText(['Experience', '• Customer Officer at Robi Axiata Limited (Jan 2020 – Present)', '• Executive at Banglalink (Mar 2017 – Dec 2019)', 'Skills', 'Excel'].join('\n'));
      expect(cv.workExperience.length).toBe(2);
      expect(cv.workExperience[0].organizationName).toBe('Robi Axiata Limited');
    });
  });

  describe('education', () => {
    it('reads label based blocks', () => {
      const cv = parseText([
        'Education',
        'MSc Passing year: 2019',
        'Subject: Mathematics CGPA: 3.29 (out of 4)',
        'Institute: Chandpur Govt. College',
        'HSC Passing year: 2014',
        'Group: Science GPA: 4.90 (out of 5)',
        'Institute: Dhadda College',
        'Skills',
        'Excel'
      ].join('\n'));
      expect(cv.education.length).toBe(2);
      expect(cv.education[0].degree).toBe('MSc');
      expect(cv.education[0].institution).toBe('Chandpur Govt. College');
      expect(cv.education[0].fieldOfStudy).toBe('Mathematics');
      expect(cv.education[0].grade).toBe('3.29/4');
      expect(year(cv.education[1].endDate)).toBe(2014);
    });

    it('reads single line entries with the institution inside the line', () => {
      const cv = parseText(['Education', 'MSc in Economics, London School of Economics, 2012', 'PhD in Economics, Australian National University, 2018', 'Skills', 'Stata'].join('\n'));
      expect(cv.education.length).toBe(2);
      expect(cv.education[0].institution).toBe('London School of Economics');
      expect(cv.education[0].fieldOfStudy).toBe('Economics');
    });

    it('reads professional qualifications, abbreviated degrees and acronym institutions', () => {
      const cv = parseText([
        'Education',
        'Chartered Accountancy (ACA) - Institute of Chartered Accountants of Bangladesh - 2014',
        'BFA in Drawing and Painting, University of Dhaka, 2015',
        'MSc in Computer Science and Engineering, BUET, 2008'
      ].join('\n') + '\nSkills\nExcel');
      expect(cv.education.map(e => e.degree)).toEqual(['ACA', 'BFA', 'MSc']);
      expect(cv.education[1].fieldOfStudy).toBe('Drawing and Painting');
      expect(cv.education[2].institution).toBe('BUET');
    });

    it('puts the institution line that precedes the degree line into the same entry', () => {
      const cv = parseText(['Education', 'Bangladesh University of Textiles', 'BSc in Textile Engineering          2008 – 2012', 'Skills', 'Excel'].join('\n'));
      expect(cv.education.length).toBe(1);
      expect(cv.education[0].institution).toBe('Bangladesh University of Textiles');
      expect(cv.education[0].fieldOfStudy).toBe('Textile Engineering');
    });

    it('does not take a field of study from the institution name', () => {
      const cv = parseText(['Education', 'MBA, Institute of Business Administration, University of Dhaka (2004)', 'Skills', 'Excel'].join('\n'));
      expect(cv.education[0].institution).toBe('Institute of Business Administration, University of Dhaka');
      expect(cv.education[0].fieldOfStudy).toBeUndefined();
    });
  });

  describe('skills, languages and certifications', () => {
    it('keeps "HTML & CSS" together but splits chips of known terms', () => {
      expect(parseText(['Skills', 'HTML & CSS', 'Java EE/ J2EE', 'Communication', 'Education', 'BSc, University of Dhaka'].join('\n')).skills.map(s => s.name)).toEqual(['HTML & CSS', 'Java EE/ J2EE', 'Communication']);
      expect(skillTermsIn('Java SpringBoot Hibernate').items).toEqual(['Java', 'SpringBoot', 'Hibernate']);
    });

    it('reads skill levels', () => {
      const cv = parseText(['Skills', 'Core Java (Expert) SpringBoot (Expert) Oracle (Advanced)', 'Education', 'BSc, University of Dhaka'].join('\n'));
      expect(cv.skills.map(s => s.level)).toEqual(['Expert', 'Expert', 'Advanced']);
    });

    it('does not read "Languages:" inside skills as a language section', () => {
      const cv = parseText(['Technical Skills', 'Languages: Java, Python', 'Tools: Git, Docker', 'Education', 'BSc, University of Dhaka'].join('\n'));
      expect(cv.skills.map(s => s.name)).toEqual(['Java', 'Python', 'Git', 'Docker']);
      expect(cv.languages.length).toBe(0);
    });

    it('reads languages with levels', () => {
      const cv = parseText(['Languages', 'Bangla (Native), English (Medium), Arabic (Low)', 'Education', 'BSc, University of Dhaka'].join('\n'));
      expect(cv.languages.map(l => l.proficiency)).toEqual(['Native', 'Conversational', 'Basic']);
    });

    it('splits certificate name from issuer and date', () => {
      const cv = parseText([
        'Certifications',
        'AWS Certified Solutions Architect – Associate, Amazon Web Services, 2022',
        'CCNP Enterprise - Cisco - 2020',
        'Education',
        'BSc, University of Dhaka'
      ].join('\n'));
      expect(cv.certifications[0].issuer).toBe('Amazon Web Services');
      expect(cv.certifications[1].name).toBe('CCNP Enterprise');
      expect(cv.certifications[1].issuer).toBe('Cisco');
      expect(year(cv.certifications[1].date)).toBe(2020);
    });
  });

  describe('links', () => {
    it('finds LinkedIn, a profile link and a bare portfolio domain, ignoring e-mail domains and footers', () => {
      const cv = parseText(['Name', 'a@gmail.com | linkedin.com/in/someone | github.com/someone', 'Portfolio: someone.dev', 'Powered by example.com', 'Skills', 'Excel', 'Education', 'BSc, University of Dhaka'].join('\n'));
      expect(cv.linkedinUrl).toBe('linkedin.com/in/someone');
      expect(cv.portfolioUrl).toBe('github.com/someone');
    });
  });

  describe('documents that are not CVs', () => {
    it('returns nothing for text without CV sections', () => {
      const cv = parseText('Thank you for submitting your application.\nYour tracking number is 123.\nPlease print this page.');
      expect(cv.workExperience.length + cv.education.length + cv.skills.length).toBe(0);
      expect(cv.summary).toBeUndefined();
    });
  });
});

describe('CV layout', () => {
  describe('HTML (Word documents)', () => {
    it('keeps header-like tables as tables and flattens key-value tables', () => {
      const blocks = htmlToBlocks('<p><strong>Academic Qualification</strong></p><table><tr><td><p>Exam Title</p></td><td><p>Institute</p></td><td><p>Pass Year</p></td></tr><tr><td><p>BSc</p></td><td><p>Chandpur College</p></td><td><p>2018</p></td></tr></table>'
        + '<table><tr><td><p>Father</p></td><td><p>:</p></td><td><p>Someone</p></td></tr></table>');
      expect(blocks[1].table?.length).toBe(2);
      expect(blocks[2].text).toBe('Father : Someone');
    });

    it('treats a table that contains tables as layout and keeps each paragraph as a line', () => {
      const blocks = htmlToBlocks('<table><tr><td><p>Skills</p><table><tr><td><p>Java</p></td></tr></table><p>Languages</p></td></tr></table>');
      expect(blocks.map(b => b.text)).toEqual(['Skills', 'Java', 'Languages']);
    });

    it('turns a heading cell next to content into a heading and its content', () => {
      const blocks = htmlToBlocks('<table><tr><td><p>Experience</p></td><td><p>Engineer</p><p>2020 - Present</p></td></tr></table>');
      expect(blocks[0].text).toBe('Experience');
      expect(blocks.slice(1).map(b => b.text)).toEqual(['Engineer', '2020 - Present']);
    });

    it('numbers ordered lists and bullets unordered lists', () => {
      const blocks = htmlToBlocks('<ol><li>First</li><li>Second</li></ol><ul><li>Point</li></ul>');
      expect(blocks.map(b => b.text)).toEqual(['1. First', '2. Second', '• Point']);
    });

    it('routes tab aligned two column lines into separate streams', () => {
      const blocks = htmlToBlocks('<p><strong>EDUCATION\t\t\t\t\tWORK EXPERIENCE</strong></p><p>BSc\t\tPassing year: 2018\t\tEngineer\tJan 2020 - Present</p>');
      const routed = routeTabColumns(blocks);
      expect(routed).not.toBeNull();
      const texts = (routed || []).map(b => (b.separator ? '|' : b.text));
      expect(texts).toContain('|');
      expect(texts.indexOf('WORK EXPERIENCE')).toBeGreaterThan(texts.indexOf('|'));
    });
  });

  describe('PDF geometry', () => {
    it('joins touching fragments without a space and separates distant ones into cells', () => {
      const blocks = pdfPagesToBlocks([[item('Educ', 20, 700, 22), item('ational Qualification', 42, 700, 100), item('Chandpur', 300, 700, 44)]], true);
      expect(blocks[0].parts).toEqual(['Educational Qualification', 'Chandpur']);
    });

    it('detects a sidebar column and keeps each column in its own stream', () => {
      const left = [item('CONTACT', 20, 700), item('a@b.com', 20, 685), item('SKILLS', 20, 650), item('Java', 20, 635), item('Spring', 20, 620), item('Oracle', 20, 605)];
      const right = [item('EXPERIENCE', 300, 700), item('Engineer', 300, 685), item('Acme Ltd', 300, 670), item('EDUCATION', 300, 640), item('BSc', 300, 625), item('Dhaka University', 300, 610)];
      const pages = [[...left, ...right, item('x', 20, 590, 10), item('y', 300, 590, 10), item('z', 20, 575, 10), item('w', 300, 575, 10)]];
      expect(hasColumns(pages)).toBeTrue();
      const blocks = pdfPagesToBlocks(pages, true);
      const texts = blocks.map(b => (b.separator ? '|' : b.text));
      expect(texts.indexOf('SKILLS')).toBeLessThan(texts.indexOf('|'));
      expect(texts.indexOf('EXPERIENCE')).toBeGreaterThan(texts.indexOf('|'));
    });

    it('rebuilds a table whose cells are vertically centred and wrapped over several lines', () => {
      const header = [item('Exam Title', 20, 760), item('Institute', 150, 760), item('Year', 330, 760)];
      const body = [
        item('SSC', 20, 700), item('Rampur', 150, 707), item('2012', 330, 700), item('High School', 150, 693),
        item('HSC', 20, 640), item('Matlab', 150, 668), item('Govt.', 150, 654), item('2014', 330, 640), item('College', 150, 640), item('Chandpur', 150, 626), item('Comilla', 150, 612)
      ];
      const heading = [item('Education', 20, 800, 60, 14)];
      const blocks = pdfPagesToBlocks([[...heading, ...header, ...body]], true);
      const cv = parseBlocks([...blocks, ...pdfPagesToBlocks([[item('Skills', 20, 500, 40, 14), item('Excel', 20, 480)]], true)]);
      expect(cv.education.length).toBe(2);
      expect(cv.education[0].institution).toBe('Rampur High School');
      expect(cv.education[1].institution).toBe('Matlab Govt. College Chandpur Comilla');
      expect(year(cv.education[1].endDate)).toBe(2014);
    });

    it('splits a two column grid inside a section into two lists', () => {
      const rows = [
        [item('Python', 20, 700), item('SQL', 300, 700)],
        [item('Tableau', 20, 685), item('Power BI', 300, 685)],
        [item('Excel', 20, 670), item('Statistics', 300, 670)]
      ];
      const blocks = pdfPagesToBlocks([rows.flat()], true);
      const gridded = splitGridBlocks(blocks);
      expect(gridded.map(b => b.text)).toEqual(['Python', 'Tableau', 'Excel', 'SQL', 'Power BI', 'Statistics']);
    });

    it('turns left-hand headings into headings with the content beside them', () => {
      const page = [
        item('Summary', 20, 700, 50), item('Analyst with ten years.', 150, 700),
        item('Experience', 20, 660, 60), item('Engineer, Acme Ltd.', 150, 660), item('2019 - Present', 150, 645),
        item('Education', 20, 610, 55), item('BSc in Physics', 150, 610),
        item('Skills', 20, 570, 35), item('Python', 150, 570)
      ];
      const texts = pdfPagesToBlocks([page], true).map(b => b.text);
      expect(texts).toContain('Experience');
      expect(texts).toContain('Engineer, Acme Ltd.');
    });
  });

  describe('OCR conversion', () => {
    it('flips the y axis, scales to points and corrects word baselines for descenders', () => {
      const items = ocrWordsToItems([
        { text: 'Hello', confidence: 90, bbox: { x0: 100, y0: 200, x1: 200, y1: 220 } },
        { text: 'gap', confidence: 90, bbox: { x0: 220, y0: 200, x1: 300, y1: 224 }, descender: 6 },
        { text: '||', confidence: 90, bbox: { x0: 10, y0: 10, x1: 20, y1: 20 } },
        { text: 'low', confidence: 10, bbox: { x0: 10, y0: 10, x1: 20, y1: 20 } }
      ], 800, 2);
      expect(items.length).toBe(2);
      expect(items[0].x).toBe(50);
      expect(items[0].y).toBe(800 - 110);
      expect(items[1].y).toBeCloseTo(800 - (224 - 4.5) / 2, 5);
    });
  });

  describe('candidate selection', () => {
    it('prefers the first candidate unless another is clearly better', () => {
      const poor = parseText('Skills\nExcel\nEducation\nBSc, University of Dhaka');
      const rich = parseText(['Experience', 'Engineer, Acme Ltd. Jan 2020 - Present', 'Education', 'BSc in Physics, Dhaka University, 2012', 'Skills', 'Python, SQL, Excel, Git', 'Languages', 'Bangla (Native)'].join('\n'));
      expect(pickBest([poor, rich])).toBe(rich);
      expect(pickBest([rich, poor])).toBe(rich);
      expect(bestScored([poor, rich])).toBe(rich);
    });
  });
});
