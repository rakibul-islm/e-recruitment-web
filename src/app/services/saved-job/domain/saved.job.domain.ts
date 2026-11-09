export class SavedJob {
    id!: number;
    jobCircularId!: number;
    jobUuid?: string;
    savedOn!: Date | string;
    jobTitle?: string;
    organizationName?: string;
    jobStatus?: string;
}
