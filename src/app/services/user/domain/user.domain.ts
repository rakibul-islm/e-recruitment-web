import { Role } from '../../role/domain/role.domain';

export class Profile {
    id!: number;
    fullName!: string;
    email!: string;
    address!: string;
    secondaryMobile!: string;
    secondaryMobileCountryCode?: string;
    mobile!: string;
    mobileCountryCode?: string;
    imageBase64!: string;
    roles?: Role[];
    organizationId?: number;
}

export class Register {
    fullName!: string;
    password!: string;
    email!: string;
    mobile!: string;
    mobileCountryCode?: string;
}

export class UserAccount {
    id!: number;
    fullName!: string;
    email!: string;
    address!: string;
    secondaryMobile!: string;
    secondaryMobileCountryCode?: string;
    mobile!: string;
    mobileCountryCode?: string;
    active!: boolean;
    locked!: boolean;
    expiryDate!: Date;
    imageBase64!: string;
    roles?: Role[];
    userGroupId!: number;
    organizationId?: number;
}