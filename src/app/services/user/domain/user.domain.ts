export class Profile {
    id!: number;
    fullName!: string;
    email!: string;
    address!: string;
    phone!: string;
    mobile!: string;
    imageBase64!: string;
    roles!: { name: string; description: string }[];
}

export class Register {
    fullName!: string;
    password!: string;
    email!: string;
    mobile!: string;
}