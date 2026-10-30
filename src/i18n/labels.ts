import type { ComponentStatus, CountUnit, Craft, ProjectStatus } from '../domain/types';
import type { NameIssue } from '../domain/validation';
import type { I18n } from './I18nProvider';
import type { MessageKey } from './messages';

type T = I18n['t'];

export const craftLabel = (t: T, craft: Craft) => t(`craft.${craft}`);
export const statusLabel = (t: T, status: ProjectStatus) => t(`status.${status}`);
export const componentStatusLabel = (t: T, status: ComponentStatus) => t(`cstatus.${status}`);

export function toolLabel(t: T, craft: Craft): string {
  return t(craft === 'knitting' ? 'tool.knitting' : craft === 'crochet' ? 'tool.crochet' : 'tool.other');
}

export function unitLabel(t: T, unit: CountUnit, plural = false): string {
  return t(plural ? (unit === 'round' ? 'unit.rounds' : 'unit.rows') : `unit.${unit}`);
}

/** Text for a name validation issue; `requiredKey` names the field-specific "is required" message. */
export function nameIssueText(t: T, issue: NameIssue | undefined, requiredKey: MessageKey, max: number) {
  if (!issue) return undefined;
  return issue === 'required' ? t(requiredKey) : t('common.tooLong', { max });
}
