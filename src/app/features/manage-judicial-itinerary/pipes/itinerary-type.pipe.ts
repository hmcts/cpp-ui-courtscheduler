import { Pipe, PipeTransform } from '@angular/core';
import { Itinerary } from '../model/judicial-itinerary.interface';
import { getJudiciaryType } from '../../../shared/utils/core.utils';

@Pipe({
  name: 'itineraryType'
})
export class ItineraryTypePipe implements PipeTransform {
  transform(itinerary: Itinerary): string {
    const judiciary = itinerary.judiciaryMember;
    if (!judiciary) {
      return 'Not added';
    }
    return getJudiciaryType(judiciary) ?? 'Not added';
  }
}
