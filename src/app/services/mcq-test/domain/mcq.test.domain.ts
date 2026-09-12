export const MCQ_TEST_STATUS_OPTIONS = [
    { label: 'mcqTest.statusDraft', value: 'DRAFT' },
    { label: 'mcqTest.statusActive', value: 'ACTIVE' },
    { label: 'mcqTest.statusArchived', value: 'ARCHIVED' }
];

export class McqTest {
    id!: number;
    companyId?: number;
    name!: string;
    description?: string;
    durationMinutes!: number;
    passingScorePercent!: number;
    questionSelectionCount?: number;
    secondsPerQuestion?: number;
    shuffleQuestions = false;
    shuffleOptions = false;
    status!: string;
    questionIds: number[] = [];
    questionCount?: number;
}

export class McqTestRequest {
    id?: number;
    name!: string;
    description?: string;
    durationMinutes!: number;
    passingScorePercent!: number;
    questionSelectionCount?: number;
    secondsPerQuestion?: number;
    shuffleQuestions = false;
    shuffleOptions = false;
    status?: string;
    questionIds: number[] = [];
}
