export class ArchiveConfig {
    id!: number;
    sourceTable!: string;
    archiveSchema!: string;
    archiveTable!: string;
    dateColumn!: string;
    retentionDays!: number;
    enabled!: boolean;
    description!: string;
    whereCondition!: string;
}

export class ArchiveConfigRequest {
    id?: number;
    sourceTable!: string;
    archiveSchema!: string;
    archiveTable!: string;
    dateColumn!: string;
    retentionDays!: number;
    enabled!: boolean;
    description!: string;
    whereCondition!: string;
}
