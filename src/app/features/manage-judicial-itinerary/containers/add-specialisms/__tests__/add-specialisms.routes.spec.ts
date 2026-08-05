import { addSpecialismsRoutes } from '../add-specialisms.routes';
import { AddSpecialismsContainer } from '../add-specialisms.container';
import { SpecialismsCheckAnswersContainer } from '../../specialisms-check-answers/specialisms-check-answers.container';

describe('addSpecialismsRoutes', () => {
  it('default path loadComponent should resolve AddSpecialismsContainer', async () => {
    expect.assertions(1);
    const route = addSpecialismsRoutes.find((r) => r.path === '');
    const Resolved = await route!.loadComponent!();
    expect(Resolved).toBe(AddSpecialismsContainer);
  });

  it('specialism-check-answers path loadComponent should resolve SpecialismsCheckAnswersContainer', async () => {
    expect.assertions(1);
    const route = addSpecialismsRoutes.find((r) => r.path === 'specialism-check-answers');
    const Resolved = await route!.loadComponent!();
    expect(Resolved).toBe(SpecialismsCheckAnswersContainer);
  });
});
