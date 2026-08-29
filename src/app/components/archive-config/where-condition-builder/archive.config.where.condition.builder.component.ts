import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../base.component';
import { ArchiveConfigService } from '../../../services/archive-config/archive.config.service';
import { ArchiveConfigColumn, ConditionClause, ConditionRow, OPERATORS_BY_CATEGORY, OP_BETWEEN, OP_IN, OP_IS_NOT_NULL, OP_IS_NULL, ParsedClause } from '../../../services/archive-config/domain/archive.config.domain';

const OPERATOR_OPTIONS_BY_CATEGORY: Record<string, { label: string; value: string }[]> = Object.fromEntries(
  Object.entries(OPERATORS_BY_CATEGORY).map(([category, operators]) => [category, operators.map(operator => ({ label: operator, value: operator }))])
);

// One entry per clause grammar this builder emits and reads back.
const CLAUSE_PATTERNS: { regex: RegExp; toClause: (match: RegExpMatchArray, unquote: (token: string) => string) => ParsedClause }[] = [
  {
    regex: /^(\S+)\s+IS\s+(NOT\s+NULL|NULL)$/i,
    toClause: match => ({ field: match[1], operator: /NOT/i.test(match[2]) ? OP_IS_NOT_NULL : OP_IS_NULL, value: '', value2: '' })
  },
  {
    regex: /^(\S+)\s+BETWEEN\s+(.+?)\s+AND\s+(.+)$/i,
    toClause: (match, unquote) => ({ field: match[1], operator: OP_BETWEEN, value: unquote(match[2]), value2: unquote(match[3]) })
  },
  {
    regex: /^(\S+)\s+IN\s*\((.+)\)$/i,
    toClause: (match, unquote) => ({ field: match[1], operator: OP_IN, value: match[2].split(',').map(unquote).join(', '), value2: '' })
  },
  {
    regex: /^(\S+)\s+(>=|<=|!=|=|>|<|LIKE)\s+(.+)$/i,
    toClause: (match, unquote) => ({ field: match[1], operator: match[2].toUpperCase(), value: unquote(match[3]), value2: '' })
  }
];

@Component({
  selector: 'app-archive-config-where-condition-builder',
  templateUrl: './archive.config.where.condition.builder.component.html',
  styleUrls: ['./archive.config.where.condition.builder.component.scss']
})
export class ArchiveConfigWhereConditionBuilderComponent extends BaseComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() sourceTable = '';
  @Input() existingCondition = '';
  @Output() apply = new EventEmitter<string>();

  fieldOptions: { label: string; value: string }[] = [];
  readonly combinatorOptions = [{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }];
  readonly booleanOptions = [{ label: 'true', value: 'true' }, { label: 'false', value: 'false' }];

  private columns: ArchiveConfigColumn[] = [];
  private rowsForm: FormArray = new FormArray<FormGroup>([]);

  constructor(
    private formBuilder: FormBuilder,
    private archiveConfigService: ArchiveConfigService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.resetRows();
      this.fetchColumns();
    }
  }

  private fetchColumns(): void {
    if (!this.sourceTable) { return; }
    this.subscribers.listColumnsSub = this.archiveConfigService.listColumns(this.sourceTable)
    .subscribe(response => {
      this.columns = response?.list || [];
      this.fieldOptions = this.columns.map(column => ({ label: column.name, value: column.name }));

      // Falls back to a blank row if the stored text isn't grammar this builder generated.
      const parsedRows = this.parseCondition(this.existingCondition);
      if (parsedRows?.length) {
        this.rowsForm = this.formBuilder.array(parsedRows);
      }
    });
  }

  // Splits on AND/OR only when followed by "field operator" - BETWEEN's own AND never matches that.
  private parseCondition(condition: string): FormGroup[] | null {
    if (!condition?.trim()) { return null; }

    const combinatorSplit = /\s+(AND|OR)\s+(?=[A-Za-z_][A-Za-z0-9_]*\s+(?:>=|<=|!=|=|>|<|LIKE\b|IN\b|IS\b|BETWEEN\b))/i;
    const parts = condition.trim().split(combinatorSplit);

    const rows: FormGroup[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const clause = this.parseClause(parts[i]);
      if (!clause) { return null; }

      const row = this.buildRow();
      row.patchValue({ combinator: i === 0 ? 'AND' : parts[i - 1].toUpperCase(), ...clause });
      rows.push(row);
    }
    return rows;
  }

  private parseClause(segment: string): ConditionClause | null {
    const clause = segment.trim();
    for (const { regex, toClause } of CLAUSE_PATTERNS) {
      const match = clause.match(regex);
      if (match) { return this.withCategory(toClause(match, this.unquote)); }
    }
    return null;
  }

  private unquote(token: string): string {
    const trimmed = token.trim();
    return trimmed.startsWith("'") && trimmed.endsWith("'")
      ? trimmed.slice(1, -1).replace(/''/g, "'")
      : trimmed;
  }

  private withCategory(clause: ParsedClause): ConditionClause | null {
    const column = this.columns.find(c => c.name.toLowerCase() === clause.field.toLowerCase());
    return column ? { ...clause, field: column.name, category: column.category } : null;
  }

  get conditionRows(): FormGroup[] {
    return this.rowsForm.controls as FormGroup[];
  }

  private buildRow(): FormGroup {
    return this.formBuilder.group({
      combinator: ['AND'],
      field: [''],
      category: [''],
      operator: [''],
      value: [''],
      value2: ['']
    });
  }

  private resetRows(): void {
    this.rowsForm = this.formBuilder.array([this.buildRow()]);
  }

  addRow(): void {
    this.rowsForm.push(this.buildRow());
  }

  removeRow(index: number): void {
    this.rowsForm.removeAt(index);
  }

  clearAll(): void {
    this.resetRows();
  }

  onFieldSelected(row: FormGroup, fieldName: string): void {
    const column = this.columns.find(c => c.name === fieldName);
    row.patchValue({ category: column?.category || 'OTHER', operator: '', value: '', value2: '' });
  }

  getOperatorOptions(category: string): { label: string; value: string }[] {
    return OPERATOR_OPTIONS_BY_CATEGORY[category] || OPERATOR_OPTIONS_BY_CATEGORY['OTHER'];
  }

  isValueHidden(operator: string): boolean {
    return operator === OP_IS_NULL || operator === OP_IS_NOT_NULL;
  }

  isBetween(operator: string): boolean {
    return operator === OP_BETWEEN;
  }

  isBoolean(category: string): boolean {
    return category === 'BOOLEAN';
  }

  isDate(category: string): boolean {
    return category === 'DATE';
  }

  isNumber(category: string): boolean {
    return category === 'NUMBER';
  }

  get preview(): string {
    return this.buildConditionString();
  }

  private buildConditionString(): string {
    const clauses: string[] = [];

    this.rowsForm.controls.forEach((control, index) => {
      const row = control.value as ConditionRow;
      if (!row.field || !row.operator) { return; }

      const clause = this.buildClause(row);
      if (!clause) { return; }

      clauses.push(index === 0 ? clause : `${row.combinator} ${clause}`);
    });

    return clauses.join(' ');
  }

  private buildClause(row: ConditionClause): string | null {
    const { field, category, operator, value, value2 } = row;

    if (this.isValueHidden(operator)) {
      return `${field} ${operator}`;
    }

    if (operator === OP_BETWEEN) {
      if (!value || !value2) { return null; }
      return `${field} BETWEEN ${this.quoteValue(value, category)} AND ${this.quoteValue(value2, category)}`;
    }

    if (operator === OP_IN) {
      const values = String(value || '').split(',').map(v => v.trim()).filter(v => v.length > 0);
      if (!values.length) { return null; }
      return `${field} IN (${values.map(v => this.quoteValue(v, category)).join(', ')})`;
    }

    if (!value && value !== '0') { return null; }
    return `${field} ${operator} ${this.quoteValue(value, category)}`;
  }

  private quoteValue(value: string, category: string): string {
    if (category === 'NUMBER' || category === 'BOOLEAN') {
      return String(value);
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  applyCondition(): void {
    if (this.hasIncompleteRow()) {
      this.notificationService.sendErrorMsg(this.translate.instant('archiveConfig.whereConditionIncomplete'));
      return;
    }
    this.apply.emit(this.buildConditionString());
    this.close();
  }

  // An empty row (no field picked) isn't incomplete - e.g. after Clear All - just unused.
  private hasIncompleteRow(): boolean {
    return this.rowsForm.controls.some(control => {
      const row = control.value as ConditionRow;
      return !!row.field && !this.buildClause(row);
    });
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
