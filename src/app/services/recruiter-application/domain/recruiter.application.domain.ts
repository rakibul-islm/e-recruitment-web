export const RECRUITER_APPLICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const RECRUITER_APPLICATION_STATUS_OPTIONS = RECRUITER_APPLICATION_STATUSES.map(status => ({
    label: 'recruiterApplication.status' + status.charAt(0) + status.slice(1).toLowerCase(),
    value: status
}));

export class RecruiterApplication {
    id!: number;
    fullName!: string;
    email!: string;
    phone?: string;
    companyName!: string;
    companyWebsite?: string;
    companyIndustry?: string;
    companySize?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyDescription?: string;
    jobTitle?: string;
    message?: string;
    status!: string;
    reviewNote?: string;
    createdOn?: Date | string;
    updatedBy?: string;
    updatedOn?: Date | string;
}

export class RecruiterApplicationRequest {
    fullName!: string;
    email!: string;
    phone?: string;
    companyName!: string;
    companyWebsite?: string;
    companyIndustry?: string;
    companySize?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyDescription?: string;
    jobTitle?: string;
    message?: string;
}
