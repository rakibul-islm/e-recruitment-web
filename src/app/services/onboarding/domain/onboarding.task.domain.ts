export class OnboardingTask {
    id!: number;
    applicationId!: number;
    title!: string;
    description?: string;
    dueDate?: Date | string;
    completed!: boolean;
    completedOn?: Date | string;
    completedBy?: string;
}
