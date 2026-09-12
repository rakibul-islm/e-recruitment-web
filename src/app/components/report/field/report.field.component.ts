import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ReportFieldDef } from '../../../services/report/domain/report.definition';

@Component({
  selector: 'app-report-field',
  templateUrl: './report.field.component.html'
})
export class ReportFieldComponent {
  @Input() field!: ReportFieldDef;
  @Input() form!: FormGroup;
}
