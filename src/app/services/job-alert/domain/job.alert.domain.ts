export class JobAlert {
    id!: number;
    keyword?: string;
    location?: string;
    category?: string;
    active!: boolean;
    lastNotifiedOn?: Date | string;
}

export class JobAlertRequest {
    id?: number;
    keyword?: string;
    location?: string;
    category?: string;
    active?: boolean = true;
}
