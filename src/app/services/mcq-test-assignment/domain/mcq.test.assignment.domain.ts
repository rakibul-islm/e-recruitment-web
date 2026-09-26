export class McqTestAssignment {
    id!: number;
    applicationId!: number;
    mcqTestId!: number;
    status!: string;
    assignedOn?: Date | string;
    assignedBy?: string;
    scheduledAt?: Date | string;
    scheduledEndAt?: Date | string;
    startedOn?: Date | string;
    deadlineAt?: Date | string;
    currentQuestionIndex?: number;
    secondsPerQuestionSnapshot?: number;
    currentQuestionDeadlineAt?: Date | string;
    submittedOn?: Date | string;
    submittedVia?: string;
    durationMinutesSnapshot?: number;
    passingScorePercentSnapshot?: number;
    scorePercent?: number;
    correctCount?: number;
    totalCount?: number;
    passed?: boolean;
    testName?: string;
    jobTitle?: string;
    candidateName?: string;
}

export const MCQ_VIOLATION_TYPES = ['TAB_HIDDEN', 'WINDOW_BLUR', 'FULLSCREEN_EXIT', 'COPY_OR_CUT', 'CONTEXT_MENU', 'BLOCKED_SHORTCUT'] as const;

export type McqViolationType = typeof MCQ_VIOLATION_TYPES[number];

export class McqViolationResult {
    counted!: boolean;
    violationCount!: number;
    limit!: number;
    action!: 'NONE' | 'WARNED' | 'TERMINATED';
}

export class McqAttemptOption {
    optionKey!: string;
    optionText!: string;
    displayOrder!: number;
    correct?: boolean;
}

export class McqAttemptQuestion {
    id!: number;
    displayOrder!: number;
    questionText!: string;
    selectedOptionKey?: string;
    correct?: boolean;
    options: McqAttemptOption[] = [];
}
