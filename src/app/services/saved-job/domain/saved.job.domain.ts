export class SavedJob {
    id!: number;
    jobCircularId!: number;
    savedOn!: Date | string;
    jobTitle?: string;
    companyName?: string;
    jobStatus?: string;
}
