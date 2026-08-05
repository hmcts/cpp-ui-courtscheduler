import { assertInInjectionContext, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * TODO: Migrate to cpp-ui-core
 * A utility function to create standard cpp router patterns as signals. Must be used within a supported injection context
 * @param router - An injected instance of the router (optional) if passed. It is also created when not passed.
 * @param activatedRoute - An injected instance of the activated route (optional) if passed. It is also created when not passed.
 */
export const createRouterSignals = (
  router = inject(Router),
  activatedRoute = inject(ActivatedRoute)
) => {
  assertInInjectionContext(createRouterSignals);
  return {
    navigationStartEvent: toSignal(
      router.events.pipe(filter((event) => event instanceof NavigationStart))
    ),

    navigationEndEvent: toSignal(
      router.events.pipe(filter((event) => event instanceof NavigationEnd))
    ),

    navigationEvent: toSignal(
      router.events.pipe(
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd)
      )
    ),

    getParam: (param: string) =>
      toSignal(activatedRoute.params.pipe(map((params) => params[param]))),

    getParams: toSignal(activatedRoute.params),

    getQueryParam: (queryParam: string) =>
      toSignal(activatedRoute.queryParams.pipe(map((params) => params[queryParam]))),

    getQueryParams: toSignal(activatedRoute.queryParams),
    activatedRoute
  };
};
