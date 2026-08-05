import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionDurationCellComponent } from './session-duration-cell.component';
import { mockCourtScheduleResponse } from '../../../../../../shared';
import { CourtScheduleSession } from '../../../../model/view-schedule.model';

describe('SessionDurationCellComponent', () => {
  let component: SessionDurationCellComponent;
  let fixture: ComponentFixture<SessionDurationCellComponent>;
  const mockSession = mockCourtScheduleResponse.courtSchedules[0].sessions[0];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionDurationCellComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDurationCellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('session', mockSession);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display slots when session is slot-based', () => {
    const slotSession: CourtScheduleSession = {
      ...mockSession,
      slotBased: true,
      maxSlots: 5
    };
    fixture.componentRef.setInput('session', slotSession);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Slots');
    expect(fixture.nativeElement.textContent).toContain('5');
  });

  it('should display duration when session is not slot-based and not all day split', () => {
    const durationSession: CourtScheduleSession = {
      ...mockSession,
      slotBased: false,
      allDaySplit: false,
      maxDuration: 120
    };
    fixture.componentRef.setInput('session', durationSession);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Duration');
  });

  it('should display AM/PM durations when session is all day split', () => {
    const allDaySession: CourtScheduleSession = {
      ...mockSession,
      slotBased: false,
      allDaySplit: true,
      maxDurationForMorning: 60,
      maxDurationForAfternoon: 90
    };
    fixture.componentRef.setInput('session', allDaySession);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('AM');
    expect(fixture.nativeElement.textContent).toContain('PM');
  });
});
