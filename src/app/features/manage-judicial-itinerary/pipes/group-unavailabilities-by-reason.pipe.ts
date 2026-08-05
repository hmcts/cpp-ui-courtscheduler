import { Pipe, PipeTransform } from '@angular/core';
import { Unavailability, UnavailabilityReason } from '../model/unavailability.interface';

@Pipe({
  name: 'groupUnavailabilitiesByReason'
})
export class GroupUnavailabilitiesByReasonPipe implements PipeTransform {
  transform(
    unavailabilities: Unavailability[] | null | undefined
  ): Map<UnavailabilityReason, Unavailability[]> {
    if (!unavailabilities || unavailabilities.length === 0) {
      return new Map<UnavailabilityReason, Unavailability[]>();
    }

    return unavailabilities.reduce((grouped, unavailability) => {
      const reason = unavailability.reason;
      if (!grouped.has(reason)) {
        grouped.set(reason, []);
      }
      grouped.get(reason)!.push(unavailability);
      return grouped;
    }, new Map<UnavailabilityReason, Unavailability[]>());
  }
}
