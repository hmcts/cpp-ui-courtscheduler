import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AssignCourtroomFormComponent } from './assign-courtroom-form.component';

describe('AssignCourtroomFormComponent', () => {
  let component: AssignCourtroomFormComponent;
  let fixture: ComponentFixture<AssignCourtroomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCourtroomFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignCourtroomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should emit submitForm with correct value on form submit', () => {
    spyOn(component.submitForm, 'emit');
    fixture.componentRef.setInput('sessionsToAssignTotal', 1);
    fixture.componentRef.setInput('courtrooms', [
      { id: 'courtroom-1', name: 'Courtroom 1' },
      { id: 'courtroom-2', name: 'Courtroom 2' }
    ]);
    fixture.detectChanges();

    component.handleSubmitForm({ courtroomId: 'courtroom-1' });

    fixture.detectChanges();
    expect(component.submitForm.emit).toHaveBeenCalledWith('courtroom-1');
  });

  it('should emit errors if the form is invalid', () => {
    spyOn(component.errors, 'emit');

    fixture.componentRef.setInput('sessionsToAssignTotal', 1);
    fixture.componentRef.setInput('courtrooms', [{ id: 'courtroom-1', name: 'Courtroom 1' }]);
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

  it('should show cancel button when sessionsToAssignTotal is 0', () => {
    fixture.componentRef.setInput('sessionsToAssignTotal', 0);
    fixture.detectChanges();

    const cancelButton = fixture.debugElement.query(
      By.css('[data-test-id="cancel-assign-courtroom-button"]')
    );
    expect(cancelButton).toBeTruthy();
  });

  it('should show form when sessionsToAssignTotal is greater than 0', () => {
    fixture.componentRef.setInput('sessionsToAssignTotal', 1);
    fixture.componentRef.setInput('courtrooms', [{ id: 'courtroom-1', name: 'Courtroom 1' }]);
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    expect(form).toBeTruthy();
  });

  it('should populate courtroom options from input', () => {
    const courtrooms = [
      { id: 'courtroom-1', name: 'Courtroom 1' },
      { id: 'courtroom-2', name: 'Courtroom 2' }
    ];

    fixture.componentRef.setInput('courtrooms', courtrooms);
    fixture.detectChanges();

    expect(component.courtroomOptions).toEqual([
      { value: 'courtroom-1', label: 'Courtroom 1' },
      { value: 'courtroom-2', label: 'Courtroom 2' }
    ]);
  });

  it('should filter out invalid courtroom options', () => {
    const courtrooms = [
      { id: 'courtroom-1', name: 'Courtroom 1' },
      { id: '', name: 'Invalid' },
      { id: 'courtroom-2', name: '' },
      { id: 'courtroom-3', name: 'Courtroom 3' }
    ];

    fixture.componentRef.setInput('courtrooms', courtrooms);
    fixture.detectChanges();

    expect(component.courtroomOptions).toEqual([
      { value: 'courtroom-1', label: 'Courtroom 1' },
      { value: 'courtroom-3', label: 'Courtroom 3' }
    ]);
  });

  it('should handle empty courtrooms array', () => {
    fixture.componentRef.setInput('courtrooms', []);
    fixture.detectChanges();

    expect(component.courtroomOptions).toEqual([]);
  });
});
