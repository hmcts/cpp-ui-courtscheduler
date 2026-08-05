import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepeatPatternSummaryComponent } from './repeat-pattern-summary.component';
import { By } from '@angular/platform-browser';
import { mockRepeatPattern } from '../../../../shared';
import * as dateUtils from '../../../../shared/utils/date-utils';

describe('RepeatPatternSummaryComponent', () => {
  let component: RepeatPatternSummaryComponent;
  let fixture: ComponentFixture<RepeatPatternSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatPatternSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RepeatPatternSummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('repeatPattern', mockRepeatPattern);
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should initialize repeatPatternDates correctly on ngOnInit', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.repeatPatternDates.startDateLabel).toEqual(
      dateUtils.parseDateToLocaleString(mockRepeatPattern.startDate)
    );
    expect(component.repeatPatternDates.endDateLabel).toEqual(
      dateUtils.parseDateToLocaleString(mockRepeatPattern.endDate)
    );
  });

  it('should display the correct repeat pattern information', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const startDateElement = fixture.debugElement.query(
      By.css('[data-test-id="startDate"]')
    ).nativeElement;
    const repeatForElement = fixture.debugElement.query(
      By.css('[data-test-id="repeat-for"]')
    ).nativeElement;
    const endDateElement = fixture.debugElement.query(
      By.css('[data-test-id="end-date"]')
    ).nativeElement;

    expect(startDateElement.textContent).toContain(
      dateUtils.parseDateToLocaleString(mockRepeatPattern.startDate)
    );
    expect(repeatForElement.textContent).toContain(mockRepeatPattern.repeatFor.toString());
    expect(endDateElement.textContent).toContain(
      dateUtils.parseDateToLocaleString(mockRepeatPattern.endDate)
    );
  });
});
