export const JOB_STATUS_OPTIONS = [
    { label: 'jobPosting.statusDraft', value: 'DRAFT' },
    { label: 'jobPosting.statusPublished', value: 'PUBLISHED' },
    { label: 'jobPosting.statusClosed', value: 'CLOSED' },
    { label: 'jobPosting.statusExpired', value: 'EXPIRED' }
];

export class JobPosting {
    id!: number;
    jobTitle!: string;
    organizationId?: number;
    organizationName?: string;
    organizationAddress?: string;
    organizationPhone?: string;
    organizationEmail?: string;
    organizationWebsite?: string;
    organizationBusiness?: string;
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
    organizationId?: number;
    organizationName?: string;
    organizationAddress?: string;
    organizationPhone?: string;
    organizationEmail?: string;
    organizationWebsite?: string;
    organizationBusiness?: string;
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
