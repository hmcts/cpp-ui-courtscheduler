import { Pipe, PipeTransform } from '@angular/core';
import { DayOfWeek } from '../model/days';

@Pipe({
  name: 'daysName'
})
export class DaysNamePipe implements PipeTransform {
  transform(days: string[]): string {
    if (!days || days.length === 0) {
      return '';
    }

    return days.map((day) => this.getDayKey(day)).join(', ');
  }

  private getDayKey(day: string): string | undefined {
    return (Object.keys(DayOfWeek) as (keyof typeof DayOfWeek)[]).find(
      (key) => DayOfWeek[key] === day
    );
  }
}
