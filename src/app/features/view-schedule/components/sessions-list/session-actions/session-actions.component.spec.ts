import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionActionsComponent } from './session-actions.component';
import { BulkActionType } from '../../../model/view-schedule.model';

describe('SessionActionsComponent', () => {
  let component: SessionActionsComponent;
  let fixture: ComponentFixture<SessionActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionActionsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default action options', () => {
    expect(component.actionOptions()).toEqual([
      { value: BulkActionType.REMOVE, label: 'Remove' },
      { value: BulkActionType.ASSIGN, label: 'Assign courtroom' }
    ]);
  });

  it('should have default selectedSessionsCount of 0', () => {
    expect(component.selectedSessionsCount()).toBe(0);
  });

  it('should accept selectedSessionsCount input', () => {
    fixture.componentRef.setInput('selectedSessionsCount', 5);
    fixture.detectChanges();
    expect(component.selectedSessionsCount()).toBe(5);
  });

  it('should emit onSubmit when handleSubmit is called', () => {
    spyOn(component.onSubmit, 'emit');
    component.handleSubmit(BulkActionType.REMOVE);
    expect(component.onSubmit.emit).toHaveBeenCalledWith(BulkActionType.REMOVE);
  });
});
