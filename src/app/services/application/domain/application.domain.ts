export const APPLICATION_STATUSES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];

// Labels are i18n keys ("applicationManagement.status<Status>"), resolved automatically by
// TranslateOptionsDirective wherever these feed a p-dropdown[optionLabel="label"].
export const APPLICATION_STATUS_OPTIONS = APPLICATION_STATUSES.map(status => ({
    label: 'applicationManagement.status' + status.charAt(0) + status.slice(1).toLowerCase(),
    value: status
}));

export class Application {
    id!: number;
    jobCircularId!: number;
    candidateUserId!: number;
    status!: string;
    coverLetter?: string;
    resumeFileId?: number;
    generatedCvId?: number;
    appliedOn!: Date | string;
    statusUpdatedOn?: Date | string;
    statusUpdatedBy?: string;
    jobTitle?: string;
    candidateName?: string;
    candidateEmail?: string;
    matchScore?: number;
}

export class ApplyRequest {
    jobCircularId!: number;
    coverLetter?: string;
    useLatestGeneratedCv?: boolean = true;
    resumeFileId?: number;
}

export class ApplicationStatusHistory {
    id!: number;
    applicationId!: number;
    status!: string;
    note?: string;
    changedBy?: string;
    changedOn!: Date | string;
}

export class CvMatchComponent {
    key!: string;
    weight!: number;
    applicable!: boolean;
    score!: number;
}

export class CvMatch {
    percent!: number;
    level!: string;
    scorable!: boolean;
    matchedSkills: string[] = [];
    missingSkills: string[] = [];
    requiredYears?: number | null;
    candidateYears!: number;
    requiredEducation?: string | null;
    candidateEducation?: string;
    keywordsMatched!: number;
    keywordsTotal!: number;
    profileCompletenessPercent!: number;
    components: CvMatchComponent[] = [];
}
