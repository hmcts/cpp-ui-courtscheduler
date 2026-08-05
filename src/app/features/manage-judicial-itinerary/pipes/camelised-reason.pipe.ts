import { Pipe, PipeTransform } from '@angular/core';
import {
  UnavailabilityReason,
  CAMELISED_UNAVAILABILITY_REASONS_MAP,
  CamelisedReasons
} from '../model/unavailability.interface';

@Pipe({
  name: 'camelisedReason'
})
export class CamelisedReasonPipe implements PipeTransform {
  transform(reason: UnavailabilityReason): CamelisedReasons {
    return CAMELISED_UNAVAILABILITY_REASONS_MAP[reason] || ('' as CamelisedReasons);
  }
}
