import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IneligibleSessionsComponent } from './ineligible-sessions.component';
import {
  SessionTableComponent,
  SessionTableConfig
} from '../session-table/session-table.component';
import { mockCourtScheduleResponse } from '../../../../../shared';
import { CourtScheduleSession } from '../../../model/view-schedule.model';
import { Component, input } from '@angular/core';
import { createReadOnlyTableConfig } from '../../../../../shared/utils/session-table.config';

@Component({
  selector: 'session-table',
  template: '<div>Mock Session Table</div>'
})
class MockSessionTableComponent {
  sessions = input<CourtScheduleSession[]>([]);
  config = input<SessionTableConfig>();
}

describe('IneligibleSessionsComponent', () => {
  let component: IneligibleSessionsComponent;
  let fixture: ComponentFixture<IneligibleSessionsComponent>;
  const mockSessions = mockCourtScheduleResponse.courtSchedules[0].sessions;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IneligibleSessionsComponent]
    })
      .overrideComponent(IneligibleSessionsComponent, {
        remove: { imports: [SessionTableComponent] },
        add: { imports: [MockSessionTableComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(IneligibleSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when no ineligible sessions', () => {
    fixture.componentRef.setInput('ineligiblePastSessions', []);
    fixture.componentRef.setInput('ineligibleWithHearings', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('should render when ineligible past sessions exist', () => {
    fixture.componentRef.setInput('ineligiblePastSessions', mockSessions);
    fixture.componentRef.setInput('ineligibleWithHearings', []);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render when ineligible sessions with hearings exist', () => {
    fixture.componentRef.setInput('ineligiblePastSessions', []);
    fixture.componentRef.setInput('ineligibleWithHearings', mockSessions);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render correctly when isEditView is true', () => {
    fixture.componentRef.setInput('ineligiblePastSessions', mockSessions);
    fixture.componentRef.setInput('isEditView', true);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render correctly when isEditView is false', () => {
    fixture.componentRef.setInput('ineligiblePastSessions', mockSessions);
    fixture.componentRef.setInput('isEditView', false);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should configure ineligiblePastSessionsTableConfig correctly for Crown Court', () => {
    fixture.componentRef.setInput('isCrownCourt', true);
    fixture.detectChanges();
    expect(component.ineligiblePastSessionsTableConfig()).toEqual(
      createReadOnlyTableConfig({ isCrownCourt: true })
    );
  });

  it('should configure ineligiblePastSessionsTableConfig correctly for Magistrates Court', () => {
    fixture.componentRef.setInput('isCrownCourt', false);
    fixture.detectChanges();
    expect(component.ineligiblePastSessionsTableConfig()).toEqual(
      createReadOnlyTableConfig({ isCrownCourt: false })
    );
  });

  it('should configure ineligibleWithHearingsTableConfig correctly', () => {
    fixture.componentRef.setInput('isCrownCourt', true);
    fixture.detectChanges();
    expect(component.ineligibleWithHearingsTableConfig()).toEqual(
      createReadOnlyTableConfig({ isCrownCourt: true })
    );
  });
});
