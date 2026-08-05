import {
  editJudicialItineraryRoutes,
  EditJudicialItineraryRoutes
} from '../edit-judicial-itinerary.routes';
import { EditJudicialItineraryContainer } from '../edit-judicial-itinerary.container';
import { JudicialItinerarySuccessComponent } from '../../../components/judicial-itinerary-success/judicial-itinerary-success.component';

describe('editJudicialItineraryRoutes', () => {
  it('should define routes with correct paths', () => {
    expect.assertions(3);

    expect(editJudicialItineraryRoutes).toHaveLength(2);
    expect(editJudicialItineraryRoutes[0].path).toBe('');
    expect(editJudicialItineraryRoutes[1].path).toBe(EditJudicialItineraryRoutes.SUCCESS);
  });

  it('should load root route component', async () => {
    expect.assertions(2);

    const loadComponent = editJudicialItineraryRoutes[0].loadComponent;
    expect(loadComponent).toBeDefined();

    const component = await loadComponent!();
    expect(component).toBe(EditJudicialItineraryContainer);
  });

  it('should load success route component', async () => {
    expect.assertions(2);

    const loadComponent = editJudicialItineraryRoutes[1].loadComponent;
    expect(loadComponent).toBeDefined();

    const component = await loadComponent!();
    expect(component).toBe(JudicialItinerarySuccessComponent);
  });

  it('should have correct data titles', () => {
    expect.assertions(2);

    expect(editJudicialItineraryRoutes[0].data?.['title']).toBe(
      'Edit Judiciary details | Common Platform'
    );
    expect(editJudicialItineraryRoutes[1].data?.['title']).toBe('Success | Common Platform');
  });
});
