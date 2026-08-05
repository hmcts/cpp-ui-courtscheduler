import { addSittingDaysRoutes, AddSittingDaysRoutes } from '../add-sitting-days.routes';
import { AddSittingDaysContainer } from '../add-sitting-days.container';
import { AddSittingDaysCheckAnswersContainer } from '../../add-sitting-days-check-answers/add-sitting-days-check-answers.container';
import { JudicialItinerarySuccessComponent } from '../../../components/judicial-itinerary-success/judicial-itinerary-success.component';

describe('addSittingDaysRoutes', () => {
  it('should define routes with correct paths', () => {
    expect.assertions(4);

    expect(addSittingDaysRoutes).toHaveLength(3);
    expect(addSittingDaysRoutes[0].path).toBe('');
    expect(addSittingDaysRoutes[1].path).toBe(AddSittingDaysRoutes.CHECK_ANSWERS);
    expect(addSittingDaysRoutes[2].path).toBe(AddSittingDaysRoutes.SUCCESS);
  });

  it('should load root route component', async () => {
    expect.assertions(2);

    const loadComponent = addSittingDaysRoutes[0].loadComponent;
    expect(loadComponent).toBeDefined();

    const component = await loadComponent!();
    expect(component).toBe(AddSittingDaysContainer);
  });

  it('should load check-answers route component', async () => {
    expect.assertions(2);

    const loadComponent = addSittingDaysRoutes[1].loadComponent;
    expect(loadComponent).toBeDefined();

    const component = await loadComponent!();
    expect(component).toBe(AddSittingDaysCheckAnswersContainer);
  });

  it('should load success route component', async () => {
    expect.assertions(2);

    const loadComponent = addSittingDaysRoutes[2].loadComponent;
    expect(loadComponent).toBeDefined();

    const component = await loadComponent!();
    expect(component).toBe(JudicialItinerarySuccessComponent);
  });

  it('should have correct data titles', () => {
    expect.assertions(3);

    expect(addSittingDaysRoutes[0].data?.['title']).toBe(
      'Add sitting days and availability | Common Platform'
    );
    expect(addSittingDaysRoutes[1].data?.['title']).toBe('Check your answers | Common Platform');
    expect(addSittingDaysRoutes[2].data?.['title']).toBe('Success | Common Platform');
  });
});
