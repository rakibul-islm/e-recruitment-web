export class PasswordPolicy {
    id!: number;
    minLength!: number;
    maxLength!: number;
    requireUppercase!: boolean;
    requireLowercase!: boolean;
    requireDigit!: boolean;
    requireSpecialChar!: boolean;
    disallowUserInfoInPassword!: boolean;
}

export class PasswordPolicyRequest {
    minLength!: number;
    maxLength!: number;
    requireUppercase!: boolean;
    requireLowercase!: boolean;
    requireDigit!: boolean;
    requireSpecialChar!: boolean;
    disallowUserInfoInPassword!: boolean;
}
