export class AppNotification {
    id!: number;
    type!: string;
    actionRoute?: string | null;
    params: Record<string, any> = {};
    read!: boolean;
    createdOn!: string;
}

export class NotificationPoll {
    unreadCount = 0;
    latestId: number | null = null;
    serverTime?: string;
}

export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
    APPLICATION_RECEIVED: 'pi-send',
    NEW_APPLICATION: 'pi-user-plus',
    APPLICATION_STATUS_CHANGED: 'pi-sync',
    INTERVIEW_SCHEDULED: 'pi-calendar',
    MCQ_TEST_ASSIGNED: 'pi-list-check',
    MCQ_TEST_PASSED: 'pi-check-circle',
    MCQ_TEST_FAILED: 'pi-times-circle',
    OFFER_RECEIVED: 'pi-gift',
    OFFER_ACCEPTED: 'pi-check-circle',
    OFFER_DECLINED: 'pi-times-circle',
    RECRUITER_APPLICATION_SUBMITTED: 'pi-building',
    MCQ_RESULT_RECEIVED: 'pi-list-check',
    JOB_ALERT_MATCH: 'pi-briefcase',
    INTERVIEW_REMINDER: 'pi-clock',
    MCQ_TEST_CLOSING: 'pi-clock',
    JOB_DEADLINE_SOON: 'pi-hourglass',
    ONBOARDING_TASK_DUE: 'pi-check-square',
    ADMIN_MESSAGE: 'pi-megaphone'
};

export const TOAST_NOTIFICATION_TYPES = ['OFFER_RECEIVED', 'INTERVIEW_SCHEDULED', 'MCQ_TEST_ASSIGNED'];

export const DEFAULT_NOTIFICATION_ICON = 'pi-bell';
