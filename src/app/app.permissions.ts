import { InjectionToken } from '@angular/core';
import {
  featuresExist,
  permissionsExist,
  RequiredPermission,
  RolePermission
} from '@cpp/users-groups';
import { UserServiceFeature } from '@cpp/users-groups/users-groups.interfaces';

export interface CourtSchedulerUserPermissions {
  create?: RequiredPermission[];
  view: RequiredPermission[];
}

export const EXPECTED_SCHEDULER_USER_PERMISSIONS =
  new InjectionToken<CourtSchedulerUserPermissions>('User Permissions', {
    providedIn: 'root',
    factory: () => userPermissions
  });

const userPermissions: CourtSchedulerUserPermissions = {
  create: [
    {
      object: 'CourtSchedule',
      action: 'Create'
    }
  ],
  view: [
    {
      object: 'CourtSchedule',
      action: 'View'
    }
  ]
};

export const createSchedulePermissionExistsHelper = (permissions: RolePermission[]) =>
  permissionsExist(permissions, userPermissions.create);

export const viewSchedulePermissionExistsHelper = (permissions: RolePermission[]) =>
  permissionsExist(permissions, userPermissions.view);

export function createScheduleAccessFeatureHelper() {
  return (features: UserServiceFeature[]) => {
    return featuresExist(features, ['courtscheduler-create']);
  };
}

export function viewScheduleAccessFeatureHelper() {
  return (features: UserServiceFeature[]) => {
    return featuresExist(features, ['courtscheduler-view']);
  };
}
