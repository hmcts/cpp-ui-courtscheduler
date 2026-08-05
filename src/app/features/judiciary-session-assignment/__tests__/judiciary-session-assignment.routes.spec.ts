import {
  judiciarySessionAssignmentRoutes,
  JudiciarySessionAssignmentRoutes
} from '../judiciary-session-assignment.routes';
import { AssignJudiciaryContainer } from '../containers/assign-judiciary/assign-judiciary.container';
import { JudiciaryReassignmentConfirmationContainer } from '../containers/judiciary-reassignment-confirmation/judiciary-reassignment-confirmation.container';

describe('judiciarySessionAssignmentRoutes', () => {
  const childRoutes = judiciarySessionAssignmentRoutes[0].children ?? [];

  it('assign route loadComponent should resolve AssignJudiciaryContainer', async () => {
    expect.assertions(1);
    const route = childRoutes.find((r) => r.path === JudiciarySessionAssignmentRoutes.ASSIGN);
    const Resolved = await route!.loadComponent!();
    expect(Resolved).toBe(AssignJudiciaryContainer);
  });

  it('reassignment-confirmation route loadComponent should resolve JudiciaryReassignmentConfirmationContainer', async () => {
    expect.assertions(1);
    const route = childRoutes.find(
      (r) => r.path === JudiciarySessionAssignmentRoutes.REASSIGNMENT_CONFIRMATION
    );
    const Resolved = await route!.loadComponent!();
    expect(Resolved).toBe(JudiciaryReassignmentConfirmationContainer);
  });
});
