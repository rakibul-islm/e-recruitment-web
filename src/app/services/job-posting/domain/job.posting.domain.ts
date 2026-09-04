export const JOB_STATUS_OPTIONS = [
    { label: 'jobPosting.statusDraft', value: 'DRAFT' },
    { label: 'jobPosting.statusPublished', value: 'PUBLISHED' },
    { label: 'jobPosting.statusClosed', value: 'CLOSED' },
    { label: 'jobPosting.statusExpired', value: 'EXPIRED' }
];

export class JobPosting {
    id!: number;
    jobTitle!: string;
    companyId?: number;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyBusiness?: string;
    applicationDeadLine!: Date | string;
    vacancy!: number;
    experience?: string;
    salary?: string;
    salaryMin?: number;
    salaryMax?: number;
    jobLocation?: string;
    jobRequirement!: string;
    jobResponsibilities?: string;
    otherBenefits?: string;
    workPlace?: string;
    employmentStatus?: string;
    skills?: string;
    category?: string;
    status!: string;
}

export class JobPostingRequest {
    id?: number;
    jobTitle!: string;
    companyId?: number;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyBusiness?: string;
    applicationDeadLine!: Date | string;
    vacancy!: number;
    experience?: string;
    salary?: string;
    salaryMin?: number;
    salaryMax?: number;
    jobLocation?: string;
    jobRequirement!: string;
    jobResponsibilities?: string;
    otherBenefits?: string;
    workPlace?: string;
    employmentStatus?: string;
    skills?: string;
    category?: string;
    status?: string;
}
