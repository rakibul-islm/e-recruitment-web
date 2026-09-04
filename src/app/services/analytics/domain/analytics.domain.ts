export class RecruitmentSummary {
    totalJobs!: number;
    publishedJobs!: number;
    totalApplications!: number;
    applicationsLast30Days!: number;
    hiresLast30Days!: number;
    avgTimeToHireDays?: number;
    applicationsByStatus: { [status: string]: number } = {};
}

export class ApplicationFunnel {
    jobCircularId?: number;
    jobTitle?: string;
    totalApplications!: number;
    statusCounts: { [status: string]: number } = {};
}
