export const MCQ_DIFFICULTY_OPTIONS = [
    { label: 'mcqQuestion.difficultyEasy', value: 'EASY' },
    { label: 'mcqQuestion.difficultyMedium', value: 'MEDIUM' },
    { label: 'mcqQuestion.difficultyHard', value: 'HARD' }
];

export const MCQ_QUESTION_STATUS_OPTIONS = [
    { label: 'mcqQuestion.statusDraft', value: 'DRAFT' },
    { label: 'mcqQuestion.statusApproved', value: 'APPROVED' }
];

export class McqOption {
    optionKey?: string;
    optionText!: string;
    correct = false;
}

export class McqQuestion {
    id!: number;
    organizationId?: number;
    questionText!: string;
    skillTag?: string;
    difficulty!: string;
    status!: string;
    source!: string;
    explanation?: string;
    options: McqOption[] = [];
}

export class McqQuestionRequest {
    id?: number;
    questionText!: string;
    skillTag?: string;
    difficulty!: string;
    status?: string;
    explanation?: string;
    options: McqOption[] = [];
}
