export const INTERVIEW_MODE_OPTIONS = [
    { label: 'applicationManagement.modeOnsite', value: 'ONSITE' },
    { label: 'applicationManagement.modePhone', value: 'PHONE' },
    { label: 'applicationManagement.modeVideo', value: 'VIDEO' }
];

export class InterviewFeedbackItem {
    interviewerUserId!: number;
    interviewerName?: string;
    rating?: number;
    comments?: string;
    submittedOn?: Date | string;
}

export class Interview {
    id!: number;
    applicationId!: number;
    title!: string;
    scheduledAt!: Date | string;
    durationMinutes?: number;
    mode?: string;
    location?: string;
    status!: string;
    interviewerUserIds: number[] = [];
    feedback: InterviewFeedbackItem[] = [];
    jobTitle?: string;
    candidateName?: string;
}

export class ScheduleInterviewRequest {
    applicationId!: number;
    title!: string;
    scheduledAt!: Date | string;
    durationMinutes?: number;
    mode?: string;
    location?: string;
    interviewerUserIds?: number[] = [];
}
