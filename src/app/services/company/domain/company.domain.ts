export class Company {
    id!: number;
    name!: string;
    logoFileId?: number;
    website?: string;
    industry?: string;
    phone?: string;
    email?: string;
    description?: string;
    address?: string;
    size?: string;
}

export class CompanyRequest {
    id?: number;
    name!: string;
    logoFileId?: number;
    website?: string;
    industry?: string;
    phone?: string;
    email?: string;
    description?: string;
    address?: string;
    size?: string;
}
