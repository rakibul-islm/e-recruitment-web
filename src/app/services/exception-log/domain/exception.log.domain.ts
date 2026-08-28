export class ExceptionLog {
    id!: number;
    traceId!: string;
    exceptionClass!: string;
    statusCode!: number;
    requestUri!: string;
    message!: string;
    stackTrace!: string;
    createdOn!: Date;
}
