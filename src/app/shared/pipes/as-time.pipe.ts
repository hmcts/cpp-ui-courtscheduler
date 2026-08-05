import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

interface AsTimeOptions {
  sessionDate?: string;
  format24h?: boolean;
  hideMeridiem?: boolean;
}

@Pipe({
  name: 'asTime'
})
export class AsTimePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: string | null | undefined, options?: AsTimeOptions): string {
    let date: Date;
    if (!value) {
      return '';
    }
    if (value.includes('-') || value.includes('T')) {
      date = new Date(value);
    } else {
      const dateStr = options?.sessionDate
        ? `${options.sessionDate}T${value}:00Z`
        : `1970-01-01T${value}:00`;
      date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) {
      return '';
    }
    const timeFormat = options?.format24h ? 'HH:mm' : 'hh:mm';
    const finalFormat = options?.hideMeridiem ? timeFormat : `${timeFormat} a`;

    return formatDate(date, finalFormat, this.locale).toLowerCase();
  }
}
