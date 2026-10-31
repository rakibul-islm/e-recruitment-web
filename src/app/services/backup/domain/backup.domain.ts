export type BackupStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface RestoreStatus {
    phase: 'IDLE' | 'VALIDATING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    fileName?: string;
    startedBy?: string;
    startedOn?: Date;
    finishedOn?: Date;
    message?: string;
}

export class DatabaseBackup {
    id!: number;
    fileName!: string;
    status!: BackupStatus;
    sizeBytes?: number;
    sha256?: string;
    tableCount?: number;
    rowCount?: number;
    databaseProduct?: string;
    errorMessage?: string;
    driveStatus?: 'UPLOADING' | 'UPLOADED' | 'FAILED' | null;
    driveError?: string;
    createdBy!: string;
    createdOn!: Date;
    finishedOn?: Date;
}
