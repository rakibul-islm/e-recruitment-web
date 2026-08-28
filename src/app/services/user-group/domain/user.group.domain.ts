import { Role } from '../../role/domain/role.domain';

export class UserGroup {
    id!: number;
    name!: string;
    description!: string;
    roles!: Role[];
}
