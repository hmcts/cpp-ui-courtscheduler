import { Pipe, PipeTransform } from '@angular/core';
import { formatSessionTime } from '@cpp/scheduling';

interface FormatTimeOptions {
  sessionDate?: string;
  format24h?: boolean;
  hideMeridiem?: boolean;
}

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {
  transform(value: string | null | undefined, options?: FormatTimeOptions): string {
    if (!value) return '';

    const formatted = formatSessionTime(value, options?.sessionDate);
    const meridiem = formatted.slice(-2);
    const timePart = formatted.slice(0, -2);

    if (options?.format24h) {
      const time24h = this.convert12To24(timePart, meridiem);
      return options?.hideMeridiem ? time24h : `${time24h}${meridiem}`;
    }

    return options?.hideMeridiem ? timePart : formatted;
  }

  private convert12To24(timePart: string, meridiem: string): string {
    const [hourStr, minutes] = timePart.split(':');
    let hour = parseInt(hourStr, 10);

    if (meridiem === 'pm' && hour < 12) {
      hour += 12;
    }
    if (meridiem === 'am' && hour === 12) {
      hour = 0;
    }

    const hours24Format = hour.toString().padStart(2, '0');
    return `${hours24Format}:${minutes}`;
  }
}
