import { Pipe, PipeTransform } from '@angular/core';
import { Unavailability } from '../model/unavailability.interface';
import { addDaysToDate, formatDate } from '../../../shared/utils/date-utils';

@Pipe({
  name: 'unavailabilityDaysCount'
})
export class UnavailabilityDaysCountPipe implements PipeTransform {
  transform(unavailabilities: Unavailability[]): number {
    if (!unavailabilities || unavailabilities.length === 0) {
      return 0;
    }
    const uniqueDays = new Set<string>();
    unavailabilities.forEach((unavailability) => {
      const startDate = new Date(unavailability.startDate);
      const endDate = unavailability.endDate ? new Date(unavailability.endDate) : startDate;
      let currentDate = startDate;
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          uniqueDays.add(formatDate(currentDate, 'yyyy-MM-dd'));
        }
        currentDate = addDaysToDate(currentDate, 1);
      }
    });
    return uniqueDays.size;
  }
}
