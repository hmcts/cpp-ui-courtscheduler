import { Pipe, PipeTransform } from '@angular/core';
import {
  judiciaryTypeGroupToJudiciaryTypePayload,
  mapRefDataJudiciaryToJudiciaryType
} from '@cpp/reference-data';
import { Itinerary } from '../model/judicial-itinerary.interface';

@Pipe({
  name: 'itineraryType'
})
export class ItineraryTypePipe implements PipeTransform {
  transform(itinerary: Itinerary): string {
    const judiciary = itinerary.judiciaryMember;
    if (!judiciary) {
      return 'Not added';
    }
    const judiciaryGroup = mapRefDataJudiciaryToJudiciaryType(judiciary.judiciaryType);
    return judiciaryTypeGroupToJudiciaryTypePayload(judiciaryGroup) ?? 'Not added';
  }
}
