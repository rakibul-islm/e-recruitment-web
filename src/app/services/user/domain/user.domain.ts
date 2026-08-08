import { Role } from '../../role/domain/role.domain';
import { UserGroup } from '../../user-group/domain/user-group.domain';

export class Profile {
    id!: number;
    fullName!: string;
    email!: string;
    address!: string;
    phone!: string;
    mobile!: string;
    imageBase64!: string;
    roles?: Role[];
}

export class Register {
    fullName!: string;
    password!: string;
    email!: string;
    mobile!: string;
}

export class UserAccount {
    id!: number;
    fullName!: string;
    email!: string;
    address!: string;
    phone!: string;
    mobile!: string;
    active!: boolean;
    locked!: boolean;
    expiryDate!: Date;
    imageBase64!: string;
    roles?: Role[];
    userGroup?: UserGroup;
}