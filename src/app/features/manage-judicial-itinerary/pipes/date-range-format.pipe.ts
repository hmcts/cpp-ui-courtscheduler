import { Pipe, PipeTransform } from '@angular/core';

type DateRangeLike = {
  startDate: string | null;
  endDate: string | null;
};

@Pipe({
  name: 'dateRangeFormat'
})
export class DateRangeFormatPipe implements PipeTransform {
  transform(dateRange: DateRangeLike, separator: ' - ' | ' to ' = ' - '): string {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'Not added';
    }

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (startDate.toDateString() === endDate.toDateString()) {
      return this.formatDate(dateRange.startDate);
    }

    return `${this.formatDate(dateRange.startDate)}${separator}${this.formatDate(dateRange.endDate)}`;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
