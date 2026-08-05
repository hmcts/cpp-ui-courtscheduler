import { ItineraryTypePipe } from '../itinerary-type.pipe';
import { Specialism } from '../../model/specialism.enum';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';

describe('ItineraryTypePipe', () => {
  let pipe: ItineraryTypePipe;

  beforeEach(() => {
    pipe = new ItineraryTypePipe();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(pipe).toBeTruthy();
  });

  it('should return "Not added" when judiciaryMember is null', () => {
    expect.assertions(1);

    const itinerary = {
      id: 'rule-1',
      courtHouseId: 'court-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD',
      repeatDays: ['Monday'],
      unavailabilities: [],
      judiciaryMember: null
    } as unknown as Itinerary;

    const result = pipe.transform(itinerary);
    expect(result).toBe('Not added');
  });

  it('should return "Not added" when judiciaryMember is undefined', () => {
    expect.assertions(1);

    const itinerary = {
      id: 'rule-1',
      courtHouseId: 'court-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD',
      repeatDays: ['Monday'],
      unavailabilities: [],
      judiciaryMember: undefined
    } as unknown as Itinerary;

    const result = pipe.transform(itinerary);
    expect(result).toBe('Not added');
  });

  it('should return empty string when judiciaryMember has no judiciaryType', () => {
    expect.assertions(1);

    const itinerary: Itinerary = {
      id: 'rule-1',
      courtHouseId: 'court-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD',
      repeatDays: ['Monday'],
      unavailabilities: [],
      judiciaryMember: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        emailAddress: 'john.smith@example.com',
        specialisms: [Specialism.MURDER]
      } as unknown as JudiciaryWithSpecialisms
    };

    const result = pipe.transform(itinerary);
    expect(result).toBe('');
  });

  it('should return judiciary type when judiciaryMember has judiciaryType', () => {
    expect.assertions(1);

    const itinerary: Itinerary = {
      id: 'rule-1',
      courtHouseId: 'court-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD',
      repeatDays: ['Monday'],
      unavailabilities: [],
      judiciaryMember: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        judiciaryType: 'Circuit Judge',
        emailAddress: 'john.smith@example.com',
        specialisms: [Specialism.MURDER]
      } as unknown as JudiciaryWithSpecialisms
    };

    const result = pipe.transform(itinerary);
    expect(result).toBe('Judge');
  });

  it('should return empty string when judiciaryType maps to no payload', () => {
    expect.assertions(1);

    const itinerary: Itinerary = {
      id: 'rule-1',
      courtHouseId: 'court-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD',
      repeatDays: ['Monday'],
      unavailabilities: [],
      judiciaryMember: {
        id: 'judge-unknown',
        judiciaryType: 'Unknown Type',
        specialisms: [Specialism.MURDER]
      } as unknown as JudiciaryWithSpecialisms
    };

    const result = pipe.transform(itinerary);
    expect(result).toBe('');
  });

  it('should return empty string when judiciaryMember has judiciaryType undefined', () => {
    expect.assertions(1);

    const itinerary: Itinerary = {
      id: 'rule-1',
      courtHouseId: 'court-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sessionType: 'AD',
      repeatDays: ['Monday'],
      unavailabilities: [],
      judiciaryMember: {
        id: 'judge-1',
        seqId: 1,
        surname: 'Smith',
        forenames: 'John',
        emailAddress: 'john.smith@example.com'
      } as unknown as JudiciaryWithSpecialisms
    };

    const result = pipe.transform(itinerary);
    expect(result).toBe('');
  });
});
