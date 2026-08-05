import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RemoveSessionsFormComponent } from './remove-sessions-form.component';
describe('RemoveSessionsFormComponent', () => {
  let component: RemoveSessionsFormComponent;
  let fixture: ComponentFixture<RemoveSessionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveSessionsFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveSessionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should emit submitForm with correct value on form submit', () => {
    spyOn(component.submitForm, 'emit');
    component.handleSubmitForm({
      removeConfirmation: true
    });

    fixture.detectChanges();
    expect(component.submitForm.emit).toHaveBeenCalledWith(true);
  });

  it('should emit errors if the form is invalid', () => {
    spyOn(component.errors, 'emit');

    fixture.componentRef.setInput('sessionsToRemoveTotal', 1);
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();
    fixture.detectChanges();
    expect(component.errors.emit).toHaveBeenCalled();
  });

  it('should emit handleCancel', () => {
    spyOn(component.cancelForm, 'emit');
    component.handleCancel();

    fixture.detectChanges();
    expect(component.cancelForm.emit).toHaveBeenCalled();
  });
});
