export class Banner {
    id!: number;
    name!: string;
    fileId?: number;
    active?: boolean;
    visibleFrom?: Date | string;
    visibleTo?: Date | string;
}

export class BannerRequest {
    id?: number;
    name!: string;
    active?: boolean;
    visibleFrom?: Date | string | null;
    visibleTo?: Date | string | null;
    imageBase64?: string;
}
