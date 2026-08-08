export class Permission {
    id!: number;
    name!: string;
    authority!: string;
    routeName!: string;
    description!: string;
    module!: string;
}

export class PermissionRequest {
    id?: number;
    name!: string;
    authority!: string;
    routeName!: string;
    description!: string;
    module!: string;
}
