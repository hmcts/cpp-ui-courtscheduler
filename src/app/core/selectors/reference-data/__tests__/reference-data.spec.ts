import { getCourtCentres } from '../reference-data';
import { CourtCentre, CourtRoom } from '../../../../shared';

const mockCourtCentre: CourtCentre = {
  id: '1',
  name: 'Liverpool',
  oucode: 'oucode',
  courtCode: 'courtCode',
  defaultStartTime: '10:00',
  defaultDuration: '6',
  courtRooms: [] as any as CourtRoom[]
};

const mockOrganisationUnitsFromCore = [
  {
    id: '1',
    oucodeL3Code: 'LCC',
    oucodeL3Name: 'Liverpool',
    oucode: 'oucode',
    oucodeL1Code: 'courtCode',
    defaultStartTime: '10:00',
    defaultDurationHrs: '6',
    courtRooms: [] as any as CourtRoom[]
  }
];

describe('reference-data selectors', () => {
  it('should return the state of the courtCentres', () => {
    const result = getCourtCentres.projector(mockOrganisationUnitsFromCore);

    expect(result).toEqual([mockCourtCentre]);
  });
});
