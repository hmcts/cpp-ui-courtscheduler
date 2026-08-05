import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { createScheduleRoutes, CreateScheduleRoutes } from './create-schedule.routes';

describe('createScheduleRoutes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(createScheduleRoutes)]
    });
    router = TestBed.inject(Router);
  });

  it('should have loadComponent function for SELECT_COURT route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.SELECT_COURT);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have loadComponent function for SELECT_BUSINESS_TYPE route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.SELECT_BUSINESS_TYPE);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have loadComponent function for SESSIONS_FORM route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.SESSIONS_FORM);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have loadComponent function for COPY_SESSIONS route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.COPY_SESSIONS);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have loadComponent function for REPEAT_PATTERN route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.REPEAT_PATTERN);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have loadComponent function for SUMMARY route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.SUMMARY);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });
  it('should have loadComponent function for REMOVE route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.REMOVE_SESSIONS);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });

  it('should have loadComponent function for SUCCESS route', async () => {
    const route = router.config.find((r) => r.path === CreateScheduleRoutes.SUCCESS);
    const component = await route?.loadComponent!();
    expect(component).toBeDefined();
  });
});
