import {
  removeJudicialItineraryRoutes,
  RemoveJudicialItineraryRoutes
} from '../remove-judicial-itinerary.routes';
import { RemoveJudicialItineraryContainer } from '../remove-judicial-itinerary.container';
import { JudicialItinerarySuccessComponent } from '../../../components/judicial-itinerary-success/judicial-itinerary-success.component';

describe('removeJudicialItineraryRoutes', () => {
  it('default path loadComponent should resolve RemoveJudicialItineraryContainer', async () => {
    expect.assertions(1);
    const route = removeJudicialItineraryRoutes.find((r) => r.path === '');
    const Resolved = await route!.loadComponent!();
    expect(Resolved).toBe(RemoveJudicialItineraryContainer);
  });

  it('success path loadComponent should resolve JudicialItinerarySuccessComponent', async () => {
    expect.assertions(1);
    const route = removeJudicialItineraryRoutes.find(
      (r) => r.path === RemoveJudicialItineraryRoutes.SUCCESS
    );
    const Resolved = await route!.loadComponent!();
    expect(Resolved).toBe(JudicialItinerarySuccessComponent);
  });
});
