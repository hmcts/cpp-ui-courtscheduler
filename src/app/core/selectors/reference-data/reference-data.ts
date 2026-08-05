import { createSelector } from '@ngrx/store';
import { AppState } from '../../reducers';
import { OrganisationUnit } from '@cpp/reference-data';
import { CourtCentre } from '../../../shared';

export const getCourtCentres = createSelector(
  (state: AppState) => (state.referenceData && state.referenceData.organisationUnits) || [],
  (organisationUnits) => organisationUnits.map(mapOrganisationUnitToCourtCentres)
);

const mapOrganisationUnitToCourtCentres = (org: OrganisationUnit): CourtCentre => {
  return {
    id: org.id,
    name: org.oucodeL3Name,
    oucode: org.oucode,
    courtCode: org.oucodeL1Code,
    defaultStartTime: org.defaultStartTime,
    defaultDuration: org.defaultDurationHrs,
    courtRooms: org.courtrooms
      ? org.courtrooms.map((cr) => ({ id: cr.id, name: cr.courtroomName }))
      : []
  };
};
