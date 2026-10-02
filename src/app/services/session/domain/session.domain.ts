export class UserSession {
    id!: number;
    userId!: number;
    userEmail!: string;
    userFullName!: string;
    jti!: string;
    issuedAt!: Date;
    expiresAt!: Date;
    ipAddress!: string;
    city!: string;
    country!: string;
    deviceType!: string;
    os!: string;
    browser!: string;
    revoked!: boolean;
    revokedAt!: Date;
    revokedBy!: string;
}

export class SessionSummary {
    activeSessions!: number;
    distinctActiveUsers!: number;
    activeGuests!: number;
}

export class GuestSession {
    guestId!: string;
    ipAddress!: string;
    city!: string;
    country!: string;
    deviceType!: string;
    os!: string;
    browser!: string;
    connectedAt!: Date;
}
