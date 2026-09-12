import { ReportDefinition } from './domain/report.definition';
import { JOB_STATUS_OPTIONS } from '../job-posting/domain/job.posting.domain';
import { APPLICATION_STATUS_OPTIONS } from '../application/domain/application.domain';
import { API_URLS } from '../utility/constants/api.urls';

export const JOB_POSTING_REPORT_DEFINITION: ReportDefinition = {
  key: 'job-posting',
  titleKey: 'report.jobPostingTitle',
  icon: 'pi pi-briefcase',
  fields: [
    { key: 'id', type: 'text', labelKey: 'applicationManagement.jobPostingId' },
    { key: 'jobTitle_like', type: 'text', labelKey: 'candidateApplication.jobTitle' },
    { key: 'status', type: 'dropdown', labelKey: 'common.status', defaultValue: null, options: [{ label: 'jobPosting.statusAll', value: null }, ...JOB_STATUS_OPTIONS] }
  ]
};

export const APPLICATION_REPORT_DEFINITION: ReportDefinition = {
  key: 'application',
  titleKey: 'report.applicationTitle',
  icon: 'pi pi-users',
  fields: [
    { key: 'jobCircularId', type: 'text', labelKey: 'applicationManagement.jobPostingId' },
    { key: 'candidateName_like', type: 'text', labelKey: 'applicationManagement.candidateName' },
    { key: 'candidateEmail_like', type: 'text', labelKey: 'applicationManagement.candidateEmail' },
    { key: 'status', type: 'dropdown', labelKey: 'common.status', defaultValue: null, options: [{ label: 'jobPosting.statusAll', value: null }, ...APPLICATION_STATUS_OPTIONS] },
    { key: 'appliedOn_gte', type: 'date', labelKey: 'applicationManagement.appliedFrom' },
    { key: 'appliedOn_lte', type: 'date', labelKey: 'applicationManagement.appliedTo' }
  ]
};

export const MCQ_RESULT_REPORT_DEFINITION: ReportDefinition = {
  key: 'mcq-result',
  titleKey: 'report.mcqResultTitle',
  icon: 'pi pi-list-check',
  fields: [
    {
      key: 'mcqTestId', type: 'async-dropdown', labelKey: 'applicationManagement.selectTest', options: [],
      asyncOptions: { endpoint: API_URLS.FILTER_MCQ_TEST, labelField: 'name', valueField: 'id', params: new Map<any, any>().set('isPageable', false) }
    },
    {
      key: 'passed', type: 'dropdown', labelKey: 'report.passedLabel', defaultValue: 'true', options: [
        { label: 'report.passedAll', value: null },
        { label: 'mcqTestTaking.passed', value: 'true' },
        { label: 'mcqTestTaking.notPassed', value: 'false' }
      ]
    },
    { key: 'scheduledAt_gte', type: 'date', labelKey: 'report.dateFrom' },
    { key: 'scheduledAt_lte', type: 'date', labelKey: 'report.dateTo' }
  ]
};

export const AUDIT_LOG_REPORT_DEFINITION: ReportDefinition = {
  key: 'audit-log',
  titleKey: 'report.auditLogTitle',
  icon: 'pi pi-history',
  fields: [
    {
      key: 'category_eq', type: 'dropdown', labelKey: 'auditLog.category', options: [
        { label: 'auditLog.categoryAll', value: null },
        { label: 'auditLog.categoryEntity', value: 'ENTITY' },
        { label: 'auditLog.categorySecurity', value: 'SECURITY' },
        { label: 'auditLog.categorySystem', value: 'SYSTEM' }
      ]
    },
    {
      key: 'action_eq', type: 'dropdown', labelKey: 'auditLog.action', options: [
        { label: 'auditLog.actionAll', value: null },
        { label: 'auditLog.actionCreate', value: 'CREATE' },
        { label: 'auditLog.actionUpdate', value: 'UPDATE' },
        { label: 'auditLog.actionSoftDelete', value: 'SOFT_DELETE' },
        { label: 'auditLog.actionHardDelete', value: 'HARD_DELETE' },
        { label: 'auditLog.actionLoginSuccess', value: 'LOGIN_SUCCESS' },
        { label: 'auditLog.actionLoginFailure', value: 'LOGIN_FAILURE' },
        { label: 'auditLog.actionLogout', value: 'LOGOUT' },
        { label: 'auditLog.actionForceLogout', value: 'FORCE_LOGOUT' },
        { label: 'auditLog.actionPasswordReset', value: 'PASSWORD_RESET' },
        { label: 'auditLog.actionPasswordSet', value: 'PASSWORD_SET' },
        { label: 'auditLog.actionOtpVerified', value: 'OTP_VERIFIED' },
        { label: 'auditLog.actionOtpFailed', value: 'OTP_FAILED' }
      ]
    },
    {
      key: 'outcome_eq', type: 'dropdown', labelKey: 'auditLog.outcome', options: [
        { label: 'auditLog.outcomeAll', value: null },
        { label: 'auditLog.outcomeSuccess', value: 'SUCCESS' },
        { label: 'auditLog.outcomeFailure', value: 'FAILURE' }
      ]
    },
    { key: 'entityType', type: 'text', labelKey: 'auditLog.entityType' },
    { key: 'entityId', type: 'text', labelKey: 'auditLog.entityId' },
    { key: 'createdBy_eq', type: 'text', labelKey: 'auditLog.createdBy' },
    { key: 'ipAddress_eq', type: 'text', labelKey: 'auditLog.ipAddress' },
    { key: 'createdOn_gte', type: 'date', labelKey: 'report.dateFrom' },
    { key: 'createdOn_lte', type: 'date', labelKey: 'report.dateTo' }
  ]
};

export const REPORT_DEFINITIONS: Record<string, ReportDefinition> = {
  'job-posting': JOB_POSTING_REPORT_DEFINITION,
  'application': APPLICATION_REPORT_DEFINITION,
  'mcq-result': MCQ_RESULT_REPORT_DEFINITION,
  'audit-log': AUDIT_LOG_REPORT_DEFINITION
};
