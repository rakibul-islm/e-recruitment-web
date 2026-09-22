export class RoleOption {
    id!: number;
    name!: string;
}

export class UserOption {
    id!: number;
    fullName!: string;
    email!: string;
}

export class NotificationBroadcastRequest {
    targetType!: 'ALL' | 'ROLE' | 'USER';
    roleId?: number | null;
    userIds?: number[];
    title!: string;
    message!: string;
    sendEmail = false;
}
