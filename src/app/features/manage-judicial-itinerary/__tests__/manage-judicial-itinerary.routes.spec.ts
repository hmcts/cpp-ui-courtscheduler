import {
  manageJudicialItineraryRoutes,
  JudicialItineraryRoutes
} from '../manage-judicial-itinerary.routes';
import { ManageJudiciaryItineraryAlertContainer } from '../containers/manage-judiciary-itinerary-alert/manage-judiciary-itinerary-alert.container';
import { ManageJudicialItineraryContainer } from '../containers/manage-judicial-itinerary/manage-judicial-itinerary.container';
import { SelectJudiciaryTypeContainer } from '../containers/select-judiciary-type/select-judiciary-type.container';
import { addSittingDaysRoutes } from '../containers/add-sitting-days/add-sitting-days.routes';
import { addSpecialismsRoutes } from '../containers/add-specialisms/add-specialisms.routes';
import { editJudicialItineraryRoutes } from '../containers/edit-judicial-itinerary/edit-judicial-itinerary.routes';
import { removeJudicialItineraryRoutes } from '../containers/remove-judicial-itinerary/remove-judicial-itinerary.routes';

describe('manageJudicialItineraryRoutes', () => {
  it('should define base and child routes with correct paths and guards', () => {
    expect.assertions(6);

    expect(manageJudicialItineraryRoutes).toHaveLength(1);
    const root = manageJudicialItineraryRoutes[0];
    expect(root.path).toBe('');

    expect(root.children?.[0]?.path).toBe('');
    expect(root.children?.[1]?.path).toBe(JudicialItineraryRoutes.SELECT_JUDICIARY_TYPE);
    expect(root.children?.[2]?.path).toBe(JudicialItineraryRoutes.ADD_SITTING_DAYS);
    expect(root.children?.[5]?.path).toBe(`${JudicialItineraryRoutes.REMOVE}/:id`);
  });

  it('should lazy load root and manage containers', async () => {
    expect.assertions(4);

    const root = manageJudicialItineraryRoutes[0];
    const rootComponentLoader = root.loadComponent;
    expect(rootComponentLoader).toBeDefined();
    const rootComponent = await rootComponentLoader!();
    expect(rootComponent).toBe(ManageJudiciaryItineraryAlertContainer);

    const manageRoute = root.children?.[0];
    const manageLoader = manageRoute?.loadComponent;
    expect(manageLoader).toBeDefined();
    const manageComponent = await manageLoader!();
    expect(manageComponent).toBe(ManageJudicialItineraryContainer);
  });

  it('should lazy load child feature routes and components', async () => {
    expect.assertions(10);

    const root = manageJudicialItineraryRoutes[0];

    const selectTypeRoute = root.children?.[1];
    const selectLoader = selectTypeRoute?.loadComponent;
    expect(selectLoader).toBeDefined();
    const selectComponent = await selectLoader!();
    expect(selectComponent).toBe(SelectJudiciaryTypeContainer);

    const addSittingRoute = root.children?.[2];
    const addSittingLoader = addSittingRoute?.loadChildren;
    expect(addSittingLoader).toBeDefined();
    const loadedAddSitting = await addSittingLoader!();
    expect(loadedAddSitting).toBe(addSittingDaysRoutes);

    const addSpecialismsRoute = root.children?.[3];
    const addSpecialismsLoader = addSpecialismsRoute?.loadChildren;
    expect(addSpecialismsLoader).toBeDefined();
    const loadedAddSpecialisms = await addSpecialismsLoader!();
    expect(loadedAddSpecialisms).toBe(addSpecialismsRoutes);

    const editRoute = root.children?.[4];
    const editLoader = editRoute?.loadChildren;
    expect(editLoader).toBeDefined();
    const loadedEditRoutes = await editLoader!();
    expect(loadedEditRoutes).toBe(editJudicialItineraryRoutes);

    const removeRoute = root.children?.[5];
    const removeLoader = removeRoute?.loadChildren;
    expect(removeLoader).toBeDefined();
    const loadedRemoveRoutes = await removeLoader!();
    expect(loadedRemoveRoutes).toBe(removeJudicialItineraryRoutes);
  });
});
