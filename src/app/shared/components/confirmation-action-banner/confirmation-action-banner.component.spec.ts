import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmationActionBannerComponent } from './confirmation-action-banner.component';

describe('ConfirmationActionBannerComponent', () => {
  let fixture: ComponentFixture<ConfirmationActionBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationActionBannerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationActionBannerComponent);
  });

  it('should show message in panel', () => {
    fixture.componentRef.setInput('message', 'Sessions added to Test Court for Magistrates');
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.css('pdk-panel[type="confirmation"]'));
    expect(panel).toBeTruthy();
    expect(panel.nativeElement.textContent).toContain(
      'Sessions added to Test Court for Magistrates'
    );
  });

  it('should show title when provided', () => {
    fixture.componentRef.setInput('title', 'Sessions added successfully');
    fixture.componentRef.setInput('message', 'Detail message');
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.css('pdk-panel[type="confirmation"]'));
    expect(panel).toBeTruthy();
    expect(panel.nativeElement.textContent).toContain('Sessions added successfully');
    expect(panel.nativeElement.textContent).toContain('Detail message');
  });
});
