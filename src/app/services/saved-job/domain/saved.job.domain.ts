export class SavedJob {
    id!: number;
    jobCircularId!: number;
    savedOn!: Date | string;
    jobTitle?: string;
    organizationName?: string;
    jobStatus?: string;
}
