export class ArchiveConfig {
    id!: number;
    sourceTable!: string;
    archiveSchema!: string;
    archiveTable!: string;
    dateColumn!: string;
    retentionDays!: number;
    enabled!: boolean;
    description!: string;
    whereCondition!: string;
}

export class ArchiveConfigRequest {
    id?: number;
    sourceTable!: string;
    archiveSchema!: string;
    archiveTable!: string;
    dateColumn!: string;
    retentionDays!: number;
    enabled!: boolean;
    description!: string;
    whereCondition!: string;
}

export class ArchiveConfigColumn {
    name!: string;
    category!: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'OTHER';
}

// One field/operator/value clause of a where-condition.
export class ConditionClause {
    field!: string;
    category!: ArchiveConfigColumn['category'];
    operator!: string;
    value!: string;
    value2!: string;
}

// A clause plus the AND/OR combinator joining it to the previous row.
export class ConditionRow extends ConditionClause {
    combinator!: 'AND' | 'OR';
}

// A clause parsed from SQL text, before its field is matched to resolve a category.
export type ParsedClause = Omit<ConditionClause, 'category'>;

export const OP_IS_NULL = 'IS NULL';
export const OP_IS_NOT_NULL = 'IS NOT NULL';
export const OP_BETWEEN = 'BETWEEN';
export const OP_IN = 'IN';

export const OPERATORS_BY_CATEGORY: Record<ArchiveConfigColumn['category'], string[]> = {
    STRING: ['=', '!=', 'LIKE', OP_IN, OP_IS_NULL, OP_IS_NOT_NULL],
    NUMBER: ['=', '!=', '>', '<', '>=', '<=', OP_BETWEEN, OP_IN, OP_IS_NULL, OP_IS_NOT_NULL],
    DATE: ['=', '!=', '>', '<', '>=', '<=', OP_BETWEEN, OP_IS_NULL, OP_IS_NOT_NULL],
    BOOLEAN: ['=', '!='],
    OTHER: ['=', '!=', OP_IS_NULL, OP_IS_NOT_NULL]
};
