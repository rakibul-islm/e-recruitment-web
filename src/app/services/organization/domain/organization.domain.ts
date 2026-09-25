export class Organization {
    id!: number;
    name!: string;
    logoFileId?: number;
    website?: string;
    sector?: string;
    phone?: string;
    email?: string;
    description?: string;
    address?: string;
    size?: string;
}

export class OrganizationRequest {
    id?: number;
    name!: string;
    logoFileId?: number;
    website?: string;
    sector?: string;
    phone?: string;
    email?: string;
    description?: string;
    address?: string;
    size?: string;
}
