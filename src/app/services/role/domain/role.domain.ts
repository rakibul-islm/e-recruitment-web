import { Permission } from '../../permission/domain/permission.domain';

export class Role {
    id!: number;
    name!: string;
    code!: string;
    description!: string;
    permissions!: Permission[];
}

export class RoleRequest {
    id?: number;
    name!: string;
    code!: string;
    description!: string;
    permissionIds!: number[];
}
