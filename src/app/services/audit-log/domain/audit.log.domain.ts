export class AuditLog {
    id!: number;
    category!: string;
    action!: string;
    entityType!: string;
    entityId!: number;
    outcome!: string;
    ipAddress!: string;
    userAgent!: string;
    city!: string;
    country!: string;
    deviceType!: string;
    os!: string;
    browser!: string;
    correlationId!: string;
    requestUri!: string;
    httpMethod!: string;
    changedFields!: string;
    createdBy!: string;
    createdOn!: Date;
}
