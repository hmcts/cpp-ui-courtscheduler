import { SortOrder } from '@cpp/pdk';
import { Itinerary } from '../model/judicial-itinerary.interface';
import { ItinerarySortField } from './manage-judiciary-itinerary.store.interfaces';

export function sortItineraries(
  items: Itinerary[],
  field: ItinerarySortField | null,
  order: SortOrder | null
): Itinerary[] {
  if (!field || !order || order === 'none') {
    return items;
  }
  return items.toSorted((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';
    const aMember = a.judiciaryMember;
    const bMember = b.judiciaryMember;

    switch (field) {
      case 'type': {
        aValue = aMember?.judiciaryType || '';
        bValue = bMember?.judiciaryType || '';
        break;
      }
      case 'name': {
        const aName = aMember ? `${aMember.surname || ''} ${aMember.forenames || ''}`.trim() : '';
        const bName = bMember ? `${bMember.surname || ''} ${bMember.forenames || ''}`.trim() : '';
        aValue = aName;
        bValue = bName;
        break;
      }
      case 'specialism': {
        const aSpecialisms = aMember?.specialisms ?? [];
        const bSpecialisms = bMember?.specialisms ?? [];
        aValue = aSpecialisms.length > 0 ? aSpecialisms[0] : '';
        bValue = bSpecialisms.length > 0 ? bSpecialisms[0] : '';
        break;
      }
    }

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}
