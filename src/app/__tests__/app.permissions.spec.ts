jest.mock('@cpp/users-groups', () => {
  const actual = jest.requireActual('@cpp/users-groups');
  return {
    ...actual,
    permissionsExist: jest.fn(),
    featuresExist: jest.fn()
  };
});

import { TestBed } from '@angular/core/testing';
import * as UsersGroups from '@cpp/users-groups';
import { RolePermission } from '@cpp/users-groups';
import { UserServiceFeature } from '@cpp/users-groups/users-groups.interfaces';
import {
  createScheduleAccessFeatureHelper,
  createSchedulePermissionExistsHelper,
  EXPECTED_SCHEDULER_USER_PERMISSIONS,
  manageJudicialItineraryPermissionExistsHelper,
  viewScheduleAccessFeatureHelper,
  viewSchedulePermissionExistsHelper
} from '../app.permissions';

describe('app.permissions', () => {
  const asRolePerms = (p: Array<{ object: string; action: string }>) =>
    p as unknown as RolePermission[];

  beforeEach(() => {
    jest.mocked(UsersGroups.permissionsExist).mockReset();
    jest.mocked(UsersGroups.featuresExist).mockReset();
  });

  it('should provide EXPECTED_SCHEDULER_USER_PERMISSIONS from factory', () => {
    expect.assertions(2);
    const p = TestBed.inject(EXPECTED_SCHEDULER_USER_PERMISSIONS);
    expect(p.view.length).toBeGreaterThan(0);
    expect(p.manageJudicialItinerary.length).toBeGreaterThan(0);
  });

  it('createSchedulePermissionExistsHelper should call permissionsExist with user create perms and expected create config', () => {
    expect.assertions(2);
    const config = TestBed.inject(EXPECTED_SCHEDULER_USER_PERMISSIONS);
    const userHeld = asRolePerms([{ object: 'CourtSchedule', action: 'Create' }]);
    jest.mocked(UsersGroups.permissionsExist).mockReturnValue(true);
    expect(createSchedulePermissionExistsHelper(userHeld)).toBe(true);
    expect(UsersGroups.permissionsExist).toHaveBeenCalledWith(userHeld, config.create);
  });

  it('viewSchedulePermissionExistsHelper should call permissionsExist with user view perms and expected view config', () => {
    expect.assertions(2);
    const config = TestBed.inject(EXPECTED_SCHEDULER_USER_PERMISSIONS);
    const userHeld = asRolePerms([{ object: 'CourtSchedule', action: 'View' }]);
    jest.mocked(UsersGroups.permissionsExist).mockReturnValue(false);
    expect(viewSchedulePermissionExistsHelper(userHeld)).toBe(false);
    expect(UsersGroups.permissionsExist).toHaveBeenCalledWith(userHeld, config.view);
  });

  it('manageJudicialItineraryPermissionExistsHelper should call permissionsExist with user manage perms and expected manage config', () => {
    expect.assertions(2);
    const config = TestBed.inject(EXPECTED_SCHEDULER_USER_PERMISSIONS);
    const userHeld = asRolePerms([{ object: 'Judicial itinerary', action: 'Manage' }]);
    jest.mocked(UsersGroups.permissionsExist).mockReturnValue(true);
    expect(manageJudicialItineraryPermissionExistsHelper(userHeld)).toBe(true);
    expect(UsersGroups.permissionsExist).toHaveBeenCalledWith(
      userHeld,
      config.manageJudicialItinerary
    );
  });

  it('createScheduleAccessFeatureHelper should call featuresExist with create feature id', () => {
    expect.assertions(2);
    jest.mocked(UsersGroups.featuresExist).mockReturnValue(true);
    const features = [] as UserServiceFeature[];
    expect(createScheduleAccessFeatureHelper()(features)).toBe(true);
    expect(UsersGroups.featuresExist).toHaveBeenCalledWith(features, ['courtscheduler-create']);
  });

  it('viewScheduleAccessFeatureHelper should call featuresExist with view feature id', () => {
    expect.assertions(2);
    jest.mocked(UsersGroups.featuresExist).mockReturnValue(false);
    const features = [] as UserServiceFeature[];
    expect(viewScheduleAccessFeatureHelper()(features)).toBe(false);
    expect(UsersGroups.featuresExist).toHaveBeenCalledWith(features, ['courtscheduler-view']);
  });
});
