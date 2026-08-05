import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JudicialMember } from '@cpp/reference-data';
import { SelectedCourtAndJudiciaryComponent } from './selected-court-and-judiciary.component';

const mockJudicialMember: JudicialMember = {
  id: 'judge-1',
  seqId: 1,
  surname: 'Alexander',
  forenames: 'Bla Bla',
  judiciaryType: 'Judge',
  emailAddress: 'test@example.com'
} as unknown as JudicialMember;

const mockJudicialMember2: JudicialMember = {
  id: 'judge-2',
  seqId: 2,
  surname: 'Bennett',
  forenames: 'John',
  judiciaryType: 'Judge',
  emailAddress: 'test2@example.com'
} as unknown as JudicialMember;

describe('SelectedCourtAndJudiciaryComponent', () => {
  let component: SelectedCourtAndJudiciaryComponent;
  let fixture: ComponentFixture<SelectedCourtAndJudiciaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedCourtAndJudiciaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedCourtAndJudiciaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "Selected court and judiciary" heading', () => {
    const heading = fixture.debugElement.query(By.css('h2'));
    expect(heading?.nativeElement.textContent?.trim()).toBe('Selected court and judiciary');
  });

  it('should show court name when provided', () => {
    fixture.componentRef.setInput('courtName', 'Lavender Hill Crown Court');
    fixture.detectChanges();
    const values = fixture.debugElement.queryAll(By.css('dd[pdk-summary-list-value]'));
    expect(values[0].nativeElement.textContent?.trim()).toBe('Lavender Hill Crown Court');
  });

  describe('when no judiciary is assigned', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('assignedJudiciary', []);
      fixture.detectChanges();
    });

    it('should show "No judiciary assigned"', () => {
      const values = fixture.debugElement.queryAll(By.css('dd[pdk-summary-list-value]'));
      expect(values[1].nativeElement.textContent?.trim()).toBe('No judiciary assigned');
    });

    it('should show Add judiciary link', () => {
      expect(
        fixture.debugElement.query(By.css('a[data-test-id="add-judiciary-link"]'))
      ).toBeTruthy();
    });

    it('should not show Change or Remove all links', () => {
      expect(
        fixture.debugElement.query(By.css('a[data-test-id="change-judiciary-link"]'))
      ).toBeFalsy();
      expect(
        fixture.debugElement.query(By.css('a[data-test-id="remove-all-judiciary-link"]'))
      ).toBeFalsy();
    });

    it('should emit assignJudiciary when Add judiciary link is clicked', () => {
      const emitSpy = jasmine.createSpy('assignJudiciary');
      component.assignJudiciary.subscribe(emitSpy);
      fixture.debugElement
        .query(By.css('a[data-test-id="add-judiciary-link"]'))
        .nativeElement.click();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('when judiciary is assigned', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('assignedJudiciary', [mockJudicialMember]);
      fixture.detectChanges();
    });

    it('should show judiciary name', () => {
      const values = fixture.debugElement.queryAll(By.css('dd[pdk-summary-list-value]'));
      expect(values[1].nativeElement.textContent?.trim().toUpperCase()).toContain('ALEXANDER');
    });

    it('should show Change and Remove all links', () => {
      expect(
        fixture.debugElement.query(By.css('a[data-test-id="change-judiciary-link"]'))
      ).toBeTruthy();
      expect(
        fixture.debugElement.query(By.css('a[data-test-id="remove-all-judiciary-link"]'))
      ).toBeTruthy();
    });

    it('should not show Add judiciary link', () => {
      expect(
        fixture.debugElement.query(By.css('a[data-test-id="add-judiciary-link"]'))
      ).toBeFalsy();
    });

    it('should emit assignJudiciary when Change link is clicked', () => {
      const emitSpy = jasmine.createSpy('assignJudiciary');
      component.assignJudiciary.subscribe(emitSpy);
      fixture.debugElement
        .query(By.css('a[data-test-id="change-judiciary-link"]'))
        .nativeElement.click();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit removeAllJudiciary when Remove all link is clicked', () => {
      const emitSpy = jasmine.createSpy('removeAllJudiciary');
      component.removeAllJudiciary.subscribe(emitSpy);
      fixture.debugElement
        .query(By.css('a[data-test-id="remove-all-judiciary-link"]'))
        .nativeElement.click();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('when multiple judiciaries are assigned', () => {
    it('should display names separated by commas', () => {
      fixture.componentRef.setInput('assignedJudiciary', [mockJudicialMember, mockJudicialMember2]);
      fixture.detectChanges();
      const value = fixture.debugElement.queryAll(By.css('dd[pdk-summary-list-value]'))[1];
      const text = value.nativeElement.textContent?.trim().toUpperCase();
      expect(text).toContain('ALEXANDER');
      expect(text).toContain('BENNETT');
      expect(text).toContain(',');
    });
  });
});
