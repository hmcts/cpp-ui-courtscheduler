import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDuration'
})
export class TimeDurationPipe implements PipeTransform {
  transform(duration: number): string {
    if (duration == null || isNaN(duration) || duration < 0) {
      return '';
    }

    const remainder = duration % 360;
    const timeUnits = [
      this.getDurationDisplay(Math.floor(duration / 360), 'day'),
      this.getDurationDisplay(Math.floor(remainder / 60), 'hour'),
      this.getDurationDisplay(remainder % 60, 'minute')
    ]
      .filter(Boolean)
      .join(' ');

    return timeUnits || '0 minutes';
  }

  private getDurationDisplay(duration: number, suffix: string): string {
    if (duration === 0 || isNaN(duration)) {
      return '';
    }
    return `${duration} ${duration > 1 ? suffix + 's' : suffix}`;
  }
}
