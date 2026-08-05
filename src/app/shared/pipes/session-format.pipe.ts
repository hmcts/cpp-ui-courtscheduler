import { Pipe, PipeTransform } from '@angular/core';
import { SessionType } from '../model/session';

@Pipe({
  name: 'sessionFormat'
})
export class SessionFormatPipe implements PipeTransform {
  transform(sessionType: SessionType | null | undefined): string {
    if (!sessionType) {
      return 'Not added';
    }
    const sessionMap: Record<SessionType, string> = {
      AD: 'All day',
      AM: 'AM',
      PM: 'PM'
    };
    return sessionMap[sessionType] || sessionType;
  }
}
