import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export interface StaleSessionState {
  redirectLink: string;
  redirectLabel: string;
}

const STALE_SESSION_PATH = '/stale-session';

/**
 * Higher-order factory that returns a CanActivateFn.
 * Use when a route requires prerequisite entries that would be lost on page refresh or deep link
 * (i.e. the Signal Store reinitialises and previously entered data is gone).
 *
 * The predicate is called synchronously inside Angular's guard injection context,
 * so inject() calls within the predicate work without any additional wrapping.
 *
 * If the predicate returns false, navigates to the stale-session page and passes
 * redirectLink and redirectLabel as router state for the component to display.
 */
export function staleSessionGuardFactory(
  predicate: () => boolean,
  redirectLink: string,
  redirectLabel: string
): CanActivateFn {
  return (): boolean => {
    const router = inject(Router);

    if (!predicate()) {
      router.navigate([STALE_SESSION_PATH], {
        state: { redirectLink, redirectLabel } satisfies StaleSessionState
      });
      return false;
    }

    return true;
  };
}
