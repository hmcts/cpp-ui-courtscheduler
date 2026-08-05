import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MagistratesJudiciarySelectionInputComponent } from '../magistrates-judiciary-selection-input.component';
import { ExtendedJudicialMember } from '../../../../model';
import { JudicialMemberNamePipe, JudiciaryTypePayload } from '@cpp/reference-data';

@Component({
  selector: 'app-test-host',
  template: `
    <magistrates-judiciary-selection-input
      [(ngModel)]="magistrates"
      [slotConfig]="slotConfig"
      (inputText)="onInputText($event)"
    />
  `,
  imports: [MagistratesJudiciarySelectionInputComponent, FormsModule]
})
class TestHostComponent {
  magistrates: ExtendedJudicialMember[] | null = null;
  slotConfig = [
    { label: 'First', required: true },
    { label: 'Second', required: false }
  ];
  onInputText(_event: { type: JudiciaryTypePayload; searchText: string }): void {}
}

describe('MagistratesJudiciarySelectionInputComponent', () => {
  let component: MagistratesJudiciarySelectionInputComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const member = (overrides: Partial<ExtendedJudicialMember> = {}): ExtendedJudicialMember =>
    ({
      id: 'm1',
      seqId: 1,
      surname: 'A',
      forenames: 'B',
      judiciaryType: 'Magistrate',
      emailAddress: 'a@b.c',
      ...overrides
    }) as ExtendedJudicialMember;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JudicialMemberNamePipe],
      teardown: { destroyAfterEach: false }
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.query(
      By.directive(MagistratesJudiciarySelectionInputComponent)
    ).componentInstance;
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);
    expect(fixture).toMatchSnapshot();
  });

  it('should sort writeValue so bench chairman precedes when length >= 2', () => {
    expect.assertions(1);
    const regular = member({ id: 'r', isBenchChairman: false });
    const chair = member({ id: 'c', isBenchChairman: true });
    component.writeValue([regular, chair]);
    expect(component.values()).toEqual([chair, regular]);
  });

  it('should emit null from onChange when no magistrates selected after updateMagistrates', () => {
    expect.assertions(1);
    const onChange = jest.fn();
    component.registerOnChange(onChange);
    component.updateMagistrates(0, null);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should emit magistrates array when at least one slot filled', () => {
    expect.assertions(1);
    const onChange = jest.fn();
    component.registerOnChange(onChange);
    const m = member();
    component.updateMagistrates(0, m);
    expect(onChange).toHaveBeenCalledWith([m]);
  });

  it('should set activeQueryIndex and emit inputText from querySuggestions', () => {
    expect.assertions(2);
    jest.spyOn(component.inputText, 'emit');
    component.querySuggestions({ type: 'Magistrate', searchText: 'ab' }, 1);
    expect(component.activeQueryIndex()).toBe(1);
    expect(component.inputText.emit).toHaveBeenCalledWith({ type: 'Magistrate', searchText: 'ab' });
  });

  it('should register onTouched without error', () => {
    expect.assertions(1);
    expect(() => component.registerOnTouched(jest.fn())).not.toThrow();
  });
});
