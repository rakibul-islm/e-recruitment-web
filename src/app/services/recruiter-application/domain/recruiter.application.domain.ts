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
    organizationName!: string;
    organizationWebsite?: string;
    organizationType?: string;
    organizationSize?: string;
    organizationAddress?: string;
    organizationPhone?: string;
    organizationEmail?: string;
    organizationDescription?: string;
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
    organizationName!: string;
    organizationWebsite?: string;
    organizationType?: string;
    organizationSize?: string;
    organizationAddress?: string;
    organizationPhone?: string;
    organizationEmail?: string;
    organizationDescription?: string;
    jobTitle?: string;
    message?: string;
}
