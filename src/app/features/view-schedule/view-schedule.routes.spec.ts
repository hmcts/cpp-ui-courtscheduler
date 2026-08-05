import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { viewScheduleRoutes, ViewScheduleRoutes } from './view-schedule.routes';

describe('viewScheduleRoutes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(viewScheduleRoutes)]
    });
    router = TestBed.inject(Router);
  });

  it('should have loadComponent function for root route', async () => {
    const route = router.config.find((r) => r.path === '');
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have correct data for root route', () => {
    const route = router.config.find((r) => r.path === '');
    expect(route?.data?.['title']).toBe('Search schedule | Common Platform');
  });

  it('should have loadComponent function for EDIT route', async () => {
    const route = router.config.find((r) => r.path === ViewScheduleRoutes.EDIT);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have correct data for EDIT route', () => {
    const route = router.config.find((r) => r.path === ViewScheduleRoutes.EDIT);
    expect(route?.data?.['title']).toBe('Edit Schedule | Common Platform');
  });

  it('should have loadComponent function for REMOVE route', async () => {
    const route = router.config.find((r) => r.path === ViewScheduleRoutes.REMOVE_SESSIONS);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });
});
