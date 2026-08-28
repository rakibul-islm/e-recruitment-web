export class SystemConfig {
    id!: number;
    configKey!: string;
    configValue!: string;
    description!: string;
    expectedValues!: string;
}

export class SystemConfigRequest {
    id?: number;
    configKey!: string;
    configValue!: string;
    description!: string;
    expectedValues!: string;
}
