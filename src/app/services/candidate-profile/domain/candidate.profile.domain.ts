export class WorkExperienceItem {
    title!: string;
    companyName!: string;
    location?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    current?: boolean;
    description?: string;
}

export class EducationItem {
    institution!: string;
    degree!: string;
    fieldOfStudy?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    current?: boolean;
    grade?: string;
}

export class SkillItem {
    name!: string;
    level?: string;
}

export class CertificationItem {
    name!: string;
    issuer?: string;
    date?: Date | string;
    credentialUrl?: string;
}

export class LanguageItem {
    name!: string;
    proficiency?: string;
}

export class ProjectItem {
    name!: string;
    description?: string;
    url?: string;
}

export class CandidateProfile {
    id!: number;
    userId!: number;
    headline?: string;
    summary?: string;
    phone?: string;
    address?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    workExperience?: WorkExperienceItem[] = [];
    education?: EducationItem[] = [];
    skills?: SkillItem[] = [];
    certifications?: CertificationItem[] = [];
    languages?: LanguageItem[] = [];
    projects?: ProjectItem[] = [];
}

export class CandidateProfileRequest {
    headline?: string;
    summary?: string;
    phone?: string;
    address?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    workExperience: WorkExperienceItem[] = [];
    education: EducationItem[] = [];
    skills: SkillItem[] = [];
    certifications: CertificationItem[] = [];
    languages: LanguageItem[] = [];
    projects: ProjectItem[] = [];
}

export class GeneratedCv {
    id!: number;
    templateKey!: string;
    storedFileId!: number;
    generatedOn!: Date | string;
}
