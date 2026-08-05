import { SelectOption } from '@cpp/pdk';
import { FrequencyTypeUnion } from '../../features/create-schedule/model/repeat-pattern';

export const INTERVAL_OPTIONS: readonly SelectOption<FrequencyTypeUnion>[] = [
  { value: 'EVERY_WEEK', label: 'week(s)' },
  { value: 'EVERY_MONTH', label: 'month(s)' }
] as const;
