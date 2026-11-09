import { editDistanceAtMostOne } from './cv.model';

const TERMS = [
  'Java', 'JavaScript', 'TypeScript', 'Python', 'C', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Golang', 'Rust', 'Kotlin', 'Swift', 'Dart', 'Scala', 'Perl', 'R', 'MATLAB', 'SQL', 'PL/SQL', 'T-SQL', 'Bash', 'Shell', 'PowerShell', 'VBA',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'SCSS', 'XML', 'JSON', 'YAML', 'UML',
  'Spring', 'Spring Boot', 'SpringBoot', 'Spring MVC', 'Spring Security', 'Spring Data', 'Hibernate', 'MyBatis', 'JPA', 'JSP', 'Servlet', 'Servlets', 'JSTL', 'JSF', 'Struts', 'Java EE', 'J2EE', 'Java ME', 'JDBC', 'Java Swing', 'Swing', 'JavaFX',
  'Angular', 'AngularJS', 'React', 'React.js', 'ReactJS', 'Next.js', 'Vue', 'Vue.js', 'Nuxt', 'Svelte', 'Node.js', 'NodeJS', 'Express', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Laravel', 'CodeIgniter', 'Symfony',
  'ASP.NET', '.NET', '.NET Core', 'Blazor', 'jQuery', 'Bootstrap', 'Tailwind', 'Tailwind CSS', 'Material UI', 'PrimeNG', 'Thymeleaf', 'Flutter', 'React Native', 'Android', 'iOS', 'Xamarin', 'Ionic',
  'JUnit', 'Mockito', 'Selenium', 'Cypress', 'Jest', 'Karma', 'Jasmine', 'Postman', 'Swagger', 'Docusaurus', 'REST API', 'RESTful API', 'REST', 'GraphQL', 'SOAP', 'Microservices',
  'Oracle', 'MySQL', 'PostgreSQL', 'Postgres', 'SQL Server', 'MSSQL', 'MongoDB', 'Redis', 'SQLite', 'MariaDB', 'Firebase', 'Elasticsearch', 'Cassandra', 'DB2',
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Docker', 'Kubernetes', 'Jenkins', 'Ansible', 'Terraform', 'Maven', 'Gradle', 'npm', 'Webpack', 'Linux', 'Ubuntu', 'Windows', 'Unix', 'AWS', 'Azure', 'GCP', 'Nginx', 'Apache', 'Tomcat', 'JBoss', 'WildFly', 'WebLogic',
  'Jira', 'Confluence', 'Trello', 'Figma', 'Photoshop', 'Illustrator', 'Adobe XD', 'BIRT', 'JasperReports', 'Jasper Reports', 'Crystal Reports', 'Power BI', 'Tableau', 'Excel', 'Word', 'PowerPoint', 'MS Office', 'MS Word', 'MS Excel', 'Outlook', 'Access',
  'Tally', 'QuickBooks', 'SAP', 'AutoCAD', 'SolidWorks', 'SPSS', 'Stata', 'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'OOP', 'Data Structures', 'Algorithms', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'
];

const BY_KEY = new Map<string, string>(TERMS.map(t => [t.toLowerCase(), t]));
const MAX_WORDS = 3;

function nearTerm(token: string): string | null {
  const key = token.toLowerCase();
  if (key.length < 3) return null;
  for (const [known, canonical] of BY_KEY) {
    if (known.length >= 3 && !known.includes(' ') && editDistanceAtMostOne(known, key)) return canonical;
  }
  return null;
}

export function repairSkillTerm(token: string): string | null {
  const clean = token.replace(/[^\w.+#]/g, '');
  return BY_KEY.get(clean.toLowerCase()) || nearTerm(clean);
}

export function skillTermsIn(line: string): { items: string[]; hits: number } {
  const words = line.split(/\s+/).filter(w => w);
  const items: string[] = [];
  let hits = 0;
  let loose: string[] = [];
  const flushLoose = () => {
    const text = loose.join(' ').replace(/^[^\w.+#]+|[^\w.+#)]+$/g, '').trim();
    if (/[A-Za-z]/.test(text)) items.push(text);
    loose = [];
  };
  let i = 0;
  while (i < words.length) {
    let matched = 0;
    for (let n = Math.min(MAX_WORDS, words.length - i); n >= 1; n--) {
      const phrase = words.slice(i, i + n).join(' ').replace(/[,;]$/, '');
      if (BY_KEY.has(phrase.toLowerCase())) {
        flushLoose();
        items.push(words.slice(i, i + n).join(' ').replace(/[,;]$/, ''));
        hits++;
        matched = n;
        break;
      }
    }
    if (matched) i += matched;
    else { loose.push(words[i]); i++; }
  }
  flushLoose();
  const repaired = items.map(item => (BY_KEY.has(item.toLowerCase()) ? item : (nearTerm(item.replace(/[^\w.+#]/g, '')) || item)));
  const nearHits = repaired.filter((item, index) => item !== items[index]).length;
  if (hits >= 1 && hits + nearHits >= 2) return { items: repaired, hits: hits + nearHits };
  return { items, hits };
}
