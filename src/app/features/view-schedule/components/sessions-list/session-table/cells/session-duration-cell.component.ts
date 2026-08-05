import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TimeDurationPipe } from '../../../../../../shared/pipes/time-duration.pipe';
import { CourtScheduleSession } from '../../../../model/view-schedule.model';

@Component({
  selector: 'session-duration-cell',
  template: `
    @if (session().slotBased) {
      <div>Slots - {{ session().maxSlots }}</div>
    }
    @if (!session().slotBased && !session().allDaySplit) {
      <div>Duration - {{ session().maxDuration | timeDuration }}</div>
    }
    @if (!session().slotBased && session().allDaySplit) {
      <div>
        AM: {{ session().maxDurationForMorning | timeDuration }}
        <br />
        PM: {{ session().maxDurationForAfternoon | timeDuration }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimeDurationPipe]
})
export class SessionDurationCellComponent {
  readonly session = input.required<CourtScheduleSession>();
}
