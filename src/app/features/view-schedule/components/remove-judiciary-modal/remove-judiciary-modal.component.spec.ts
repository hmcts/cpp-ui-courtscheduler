import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PDK_MODAL_DATA_TOKEN } from '@cpp/pdk';
import { RemoveJudiciaryModalComponent } from './remove-judiciary-modal.component';

describe('RemoveJudiciaryModalComponent', () => {
  let fixture: ComponentFixture<RemoveJudiciaryModalComponent>;
  const confirm = jasmine.createSpy('confirm');
  const cancel = jasmine.createSpy('cancel');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveJudiciaryModalComponent],
      providers: [
        {
          provide: PDK_MODAL_DATA_TOKEN,
          useValue: { confirm, cancel }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveJudiciaryModalComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call confirm when Yes is clicked', () => {
    fixture.debugElement.nativeElement
      .querySelector('[data-test-id="remove-all-judiciary-confirm-button"]')
      .click();
    expect(confirm).toHaveBeenCalled();
  });

  it('should call cancel when Cancel is clicked', () => {
    fixture.debugElement.nativeElement
      .querySelector('[data-test-id="remove-all-judiciary-cancel-link"]')
      .click();
    expect(cancel).toHaveBeenCalled();
  });
});
