export class UserSession {
    id!: number;
    userId!: number;
    userEmail!: string;
    userFullName!: string;
    jti!: string;
    issuedAt!: Date;
    expiresAt!: Date;
    ipAddress!: string;
    userAgent!: string;
    revoked!: boolean;
    revokedAt!: Date;
    revokedBy!: string;
}

export class SessionSummary {
    activeSessions!: number;
    distinctActiveUsers!: number;
    activeGuests!: number;
}
