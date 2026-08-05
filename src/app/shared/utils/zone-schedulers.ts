import { NgZone } from '@angular/core';
import { SchedulerLike, Subscription } from 'rxjs';

export class EnterZoneScheduler implements SchedulerLike {
  constructor(private zone: NgZone, private scheduler: SchedulerLike) {}

  schedule(...args: [any, any, any]): Subscription {
    return this.zone.run(() => this.scheduler.schedule.apply(this.scheduler, args));
  }

  now(): number {
    return this.scheduler.now();
  }
}

export class LeaveZoneScheduler implements SchedulerLike {
  constructor(private zone: NgZone, private scheduler: SchedulerLike) {}

  schedule(...args: [any, any, any]): Subscription {
    return this.zone.runOutsideAngular(() => this.scheduler.schedule.apply(this.scheduler, args));
  }

  now(): number {
    return this.scheduler.now();
  }
}
