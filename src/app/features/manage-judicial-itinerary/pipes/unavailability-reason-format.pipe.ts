import { Pipe, PipeTransform } from '@angular/core';
import {
  UnavailabilityReason,
  UNAVAILABILITY_REASONS_MAP
} from '../model/unavailability.interface';

@Pipe({
  name: 'unavailabilityReasonFormat'
})
export class UnavailabilityReasonFormatPipe implements PipeTransform {
  transform(reason: UnavailabilityReason): string {
    return UNAVAILABILITY_REASONS_MAP[reason] || 'Unknown';
  }
}
