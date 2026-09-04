export class Offer {
    id!: number;
    applicationId!: number;
    position?: string;
    salaryOffered?: string;
    startDate?: Date | string;
    expiryDate?: Date | string;
    status!: string;
    offerLetterFileId?: number;
    notes?: string;
    respondedOn?: Date | string;
    jobTitle?: string;
    candidateName?: string;
}

export class CreateOfferRequest {
    applicationId!: number;
    position?: string;
    salaryOffered?: string;
    startDate?: Date | string;
    expiryDate?: Date | string;
    notes?: string;
}
