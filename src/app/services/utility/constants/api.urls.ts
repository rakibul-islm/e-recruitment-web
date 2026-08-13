export const API_URLS = {
    AUTHENTICATE: 'authenticate/token',
    GOOGLE_AUTHENTICATE: 'authenticate/google',
    FORGOT_PASSWORD: 'authenticate/forgot-password',
    VERIFY_OTP: 'authenticate/verify-otp',
    RESET_PASSWORD: 'authenticate/reset-password',
    SET_PASSWORD: 'authenticate/set-password',
    FETCH_PROFILE: 'profile',
    UPDATE_PROFILE: 'profile',
    REQUEST_CHANGE_PASSWORD_OTP: 'profile/change-password/request-otp',
    VERIFY_CHANGE_PASSWORD_OTP: 'profile/change-password/verify-otp',
    CHANGE_PASSWORD: 'profile/change-password',
    CREATE_REGISTER_USER: 'user/signup',
    VERIFY_SIGNUP_OTP: 'user/verify-signup-otp',
    RESEND_SIGNUP_OTP: 'user/resend-signup-otp',
    FIND_USER_BY_ID: 'user/:id',
    UPDATE_USER: 'user',

    FILTER_USER: 'user/filter',
    CREATE_USER: 'user',
    DELETE_USER: 'user/:id',

    FILTER_ROLE: 'role/filter',
    CREATE_ROLE: 'role',
    UPDATE_ROLE: 'role',
    FIND_ROLE_BY_ID: 'role/:id',
    DELETE_ROLE: 'role/:id',

    FILTER_PERMISSION: 'permission/filter',
    CREATE_PERMISSION: 'permission',
    UPDATE_PERMISSION: 'permission',
    FIND_PERMISSION_BY_ID: 'permission/:id',
    DELETE_PERMISSION: 'permission/:id',

    FILTER_USER_GROUP: 'user-group/filter',
    CREATE_USER_GROUP: 'user-group',
    UPDATE_USER_GROUP: 'user-group',
    FIND_USER_GROUP_BY_ID: 'user-group/:id',
    DELETE_USER_GROUP: 'user-group/:id',

    FILTER_SYSTEM_CONFIG: 'system-config/filter',
    UPDATE_SYSTEM_CONFIG: 'system-config',
    FIND_SYSTEM_CONFIG_BY_ID: 'system-config/:id',

    FIND_PASSWORD_POLICY: 'password-policy',
    UPDATE_PASSWORD_POLICY: 'password-policy',

};