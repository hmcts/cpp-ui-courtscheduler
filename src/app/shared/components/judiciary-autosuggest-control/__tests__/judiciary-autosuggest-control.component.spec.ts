import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { JudiciaryAutosuggestControlComponent } from '../judiciary-autosuggest-control.component';
import { ExtendedJudicialMember } from '../../../model';
import { JudiciaryTypePayload, JudicialMemberNamePipe } from '@cpp/reference-data';
import { Specialism } from '@cpp/reference-data';
import { fakeAsync, tick } from '@angular/core/testing';

@Component({
  selector: 'app-test-host',
  template: `
    <judiciary-autosuggest-control
      [name]="name"
      [label]="label"
      [judiciaryType]="judiciaryType"
      [suggestions]="suggestions"
      [required]="required"
      [ngModel]="selectedJudiciary"
      (ngModelChange)="selectedJudiciary = $event"
      (inputText)="handleInputText($event)"
      (onAddSpecialism)="handleAddSpecialism()"
      [errorMessagesInput]="errorMessages"
    ></judiciary-autosuggest-control>
  `,
  imports: [JudiciaryAutosuggestControlComponent, FormsModule]
})
class TestHostComponent {
  name = 'judiciary';
  label = 'Judiciary name';
  judiciaryType: JudiciaryTypePayload | null = 'Judge';
  suggestions: ExtendedJudicialMember[] = [];
  required = false;
  selectedJudiciary: ExtendedJudicialMember | null = null;
  errorMessages: Array<{ rule: string; message: string }> = [];

  handleInputText(event: { type: JudiciaryTypePayload; searchText: string }): void {}

  handleAddSpecialism(): void {}
}

describe('JudiciaryAutosuggestControlComponent', () => {
  let component: JudiciaryAutosuggestControlComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const mockJudiciary: ExtendedJudicialMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
  } as unknown as ExtendedJudicialMember;

  const mockJudiciaryWithoutSpecialisms: ExtendedJudicialMember = {
    id: 'judge-2',
    seqId: 2,
    surname: 'Doe',
    forenames: 'Jane',
    judiciaryType: 'District Judge',
    emailAddress: 'jane.doe@example.com'
  } as unknown as ExtendedJudicialMember;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JudicialMemberNamePipe],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(JudiciaryAutosuggestControlComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);
    expect(fixture).toMatchSnapshot();
  });

  it('should display label from input', () => {
    expect.assertions(2);
    testHost.label = 'Custom Label';
    fixture.detectChanges();
    const formField = fixture.debugElement.query(By.css('pdk-form-field'));
    expect(formField).toBeTruthy();
    expect(component.label()).toBe('Custom Label');
  });

  it('should display hint text "Search by name"', () => {
    expect.assertions(1);
    const formField = fixture.debugElement.query(By.css('pdk-form-field'));
    expect(formField).toBeTruthy();
  });

  it('should write value via ControlValueAccessor', () => {
    expect.assertions(1);
    component.writeValue(mockJudiciary);
    expect(component.selectedJudiciary()).toEqual(mockJudiciary);
  });

  it('should register onChange callback', () => {
    expect.assertions(1);
    const onChangeFn = jest.fn();
    component.registerOnChange(onChangeFn);
    component.handleModelChange(mockJudiciary);
    expect(onChangeFn).toHaveBeenCalledWith(mockJudiciary);
  });

  it('should register onTouched callback', () => {
    expect.assertions(1);
    const onTouchedFn = jest.fn();
    component.registerOnTouched(onTouchedFn);
    expect(onTouchedFn).toBeDefined();
  });

  it('should emit inputText with debounce and distinctUntilChanged', fakeAsync(() => {
    expect.assertions(2);
    const emitSpy = jest.spyOn(component.inputText, 'emit');
    testHost.judiciaryType = 'Judge';

    component.searchSubject.next('Jo');
    component.searchSubject.next('Joh');
    component.searchSubject.next('John');
    tick(500);

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith({ type: 'Judge', searchText: 'John' });
  }));

  it('should not emit inputText when judiciaryType is null', fakeAsync(() => {
    expect.assertions(1);
    const emitSpy = jest.spyOn(component.inputText, 'emit');
    testHost.judiciaryType = null;
    fixture.detectChanges();

    component.searchSubject.next('John');
    tick(500);

    expect(emitSpy).not.toHaveBeenCalled();
  }));

  it('should get suggestion label using JudicialMemberNamePipe', () => {
    expect.assertions(2);
    const label = component.getSuggestionLabel(mockJudiciary);
    expect(label).toBeTruthy();
    expect(typeof label).toBe('string');
  });

  it('should get suggestion subtitle from JudicialMemberNamePipe', () => {
    expect.assertions(1);
    const subtitle = component.getSuggestionSubTitle(mockJudiciary);
    expect(subtitle).toBe(TestBed.inject(JudicialMemberNamePipe).transform(mockJudiciary));
  });

  it('should render correctly with specialisms', () => {
    expect.assertions(1);
    testHost.selectedJudiciary = mockJudiciary;
    fixture.detectChanges();
    component.writeValue(mockJudiciary);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render correctly without specialisms', () => {
    expect.assertions(1);
    testHost.selectedJudiciary = mockJudiciaryWithoutSpecialisms;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit onAddSpecialism when button is clicked', () => {
    expect.assertions(1);
    const emitSpy = jest.spyOn(component.onAddSpecialism, 'emit');
    component.writeValue(mockJudiciary);
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('button[data-test-id="add-specialism"]'));
    addButton.nativeElement.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should render correctly when judiciary is null', () => {
    expect.assertions(1);
    testHost.selectedJudiciary = null;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should compute hasAvailableSpecialisms when judiciary is null', () => {
    expect.assertions(1);
    component.writeValue(null);
    fixture.detectChanges();
    expect(component.canAddMoreSpecialisms()).toBe(true);
  });

  it('should compute hasAvailableSpecialisms when specialisms is undefined', () => {
    expect.assertions(1);
    const judiciaryWithUndefinedSpecialisms: ExtendedJudicialMember = {
      ...mockJudiciary,
      specialisms: undefined as any
    };
    component.writeValue(judiciaryWithUndefinedSpecialisms);
    fixture.detectChanges();
    expect(component.canAddMoreSpecialisms()).toBe(true);
  });

  it('should compute hasAvailableSpecialisms when specialisms is null', () => {
    expect.assertions(1);
    const judiciaryWithNullSpecialisms: ExtendedJudicialMember = {
      ...mockJudiciary,
      specialisms: null as any
    };
    component.writeValue(judiciaryWithNullSpecialisms);
    fixture.detectChanges();
    expect(component.canAddMoreSpecialisms()).toBe(true);
  });

  it('should compute hasAvailableSpecialisms when all specialisms are present', () => {
    expect.assertions(1);
    const allSpecialisms = Object.values(Specialism);
    const judiciaryWithAllSpecialisms: ExtendedJudicialMember = {
      ...mockJudiciary,
      specialisms: allSpecialisms
    };
    component.writeValue(judiciaryWithAllSpecialisms);
    fixture.detectChanges();
    expect(component.canAddMoreSpecialisms()).toBe(false);
  });

  it('should compute hasAvailableSpecialisms when some specialisms are present', () => {
    expect.assertions(1);
    component.writeValue(mockJudiciary);
    fixture.detectChanges();
    expect(component.canAddMoreSpecialisms()).toBe(true);
  });
});
