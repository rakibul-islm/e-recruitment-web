export type ReportFieldType = 'text' | 'dropdown' | 'date' | 'async-dropdown';

export interface ReportFieldOption {
  label: string;
  value: any;
}

export interface ReportFieldAsyncOptionsSource {
  endpoint: string;
  labelField: string;
  valueField: string;
  params?: Map<any, any>;
}

export interface ReportFieldDef {
  key: string;
  type: ReportFieldType;
  labelKey: string;
  defaultValue?: any;
  options?: ReportFieldOption[];
  asyncOptions?: ReportFieldAsyncOptionsSource;
}

export interface ReportDefinition {
  key: string;
  titleKey: string;
  icon: string;
  fields: ReportFieldDef[];
}
