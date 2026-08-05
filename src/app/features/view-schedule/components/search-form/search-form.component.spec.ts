import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFormComponent } from './search-form.component';
import { ValidationError } from '@cpp/pdk';
import {
  mockBusinessType,
  mockMagistratesCourtCentre,
  mockCrownCourtCentre,
  mockMagistratesBusinessTypes,
  mockCrownBusinessTypes,
  mockSearchFormValues
} from '../../../../shared';
import { SearchFormValues } from '../../model/view-schedule.model';
import * as dateUtils from '../../../../shared/utils/date-utils';
import { provideMockStore } from '@ngrx/store/testing';
import { JurisdictionType } from '../../../../shared/model/jurisdiction';

describe('SearchFormComponent', () => {
  let component: SearchFormComponent;
  let fixture: ComponentFixture<SearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent],
      providers: [provideMockStore()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit errors on form validation error', () => {
    const errors: ValidationError[] = [
      {
        message: 'Error message',
        id: ''
      }
    ];
    spyOn(component.errors, 'emit');
    component.errors.emit(errors);
    expect(component.errors.emit).toHaveBeenCalledWith(errors);
  });

  it('should handle start date change and update form values and labels', () => {
    const startDate = '2024-07-01';
    spyOn(dateUtils, 'addDaysToDate').and.returnValue(new Date('2024-07-07'));
    spyOn(dateUtils, 'getInsetLabel').and.callThrough();
    spyOn(dateUtils, 'parseDateToString').and.returnValue('2024-07-07');

    component.handleStartDateChange(startDate);

    expect(dateUtils.addDaysToDate).toHaveBeenCalledWith(
      new Date(startDate),
      dateUtils.DAYS_TO_NEXT_SUNDAY
    );
    expect(dateUtils.getInsetLabel).toHaveBeenCalledTimes(2);
    expect(dateUtils.parseDateToString).toHaveBeenCalled();
    expect(component.startDateLabel).toBeTruthy();
    expect(component.endDateLabel).toBeTruthy();
    expect(component.formValues.endDate).toEqual('2024-07-07');
    expect(component.formValues.minEndDate).toEqual(new Date('2024-07-07'));
  });

  it('should handle end date change and update form values and labels', () => {
    const endDate = '2024-07-07';
    spyOn(dateUtils, 'getInsetLabel').and.callThrough();

    component.handleEndDateChange(endDate);

    expect(component.formValues.endDate).toBe(endDate);
    expect(dateUtils.getInsetLabel).toHaveBeenCalledWith(new Date(endDate));
    expect(component.endDateLabel).toBeTruthy();
  });

  it('should emit form values on form submit', () => {
    const formValues: SearchFormValues = {
      courtCentre: mockMagistratesCourtCentre,
      businessType: mockBusinessType.typeCode,
      courtroomId: null,
      startDate: '2024-07-01',
      minEndDate: null,
      endDate: '2024-07-07'
    };
    spyOn(component.submitForm, 'emit');
    component.handleSubmitForm(formValues);
    expect(component.submitForm.emit).toHaveBeenCalledWith(formValues);
  });

  it('should disable non-Monday dates', () => {
    const date = new Date('2024-07-02'); // Not a Monday
    expect(component.isDateNotMonday(date)).toBe(true);
  });

  it('should disable dates that are not Sundays after the start date', () => {
    const startDate = '2024-07-01'; // A Monday
    component.formValues.startDate = startDate;
    spyOn(dateUtils, 'getSundaysAfterStartDate').and.returnValue([new Date('2024-07-07')]);

    const date = new Date('2024-07-07'); // A Sunday
    expect(component.isDateDisabled(date)).toBe(false);

    const anotherDate = new Date('2024-07-08'); // Not a Sunday
    expect(component.isDateDisabled(anotherDate)).toBe(true);
  });

  describe('MAGISTRATES jurisdiction', () => {
    beforeEach(() => {
      component.jurisdiction.set(JurisdictionType.MAGISTRATES);
      fixture.detectChanges();
    });

    it('should emit form values on form submit', () => {
      const formValues: SearchFormValues = {
        courtCentre: mockMagistratesCourtCentre,
        businessType: mockMagistratesBusinessTypes[0].typeCode,
        courtroomId: null,
        startDate: '2024-07-01',
        minEndDate: null,
        endDate: '2024-07-07'
      };
      spyOn(component.submitForm, 'emit');
      component.handleSubmitForm(formValues);
      expect(component.submitForm.emit).toHaveBeenCalledWith(formValues);
    });
  });

  describe('CROWN jurisdiction', () => {
    beforeEach(() => {
      component.jurisdiction.set(JurisdictionType.CROWN);
      fixture.detectChanges();
    });

    it('should emit form values on form submit', () => {
      const formValues: SearchFormValues = {
        courtCentre: mockCrownCourtCentre,
        businessType: mockCrownBusinessTypes[0].typeCode,
        courtroomId: null,
        startDate: '2024-07-01',
        minEndDate: null,
        endDate: '2024-07-07'
      };
      spyOn(component.submitForm, 'emit');
      component.handleSubmitForm(formValues);
      expect(component.submitForm.emit).toHaveBeenCalledWith(formValues);
    });
  });

  it('should clear form values when initialValues becomes null', () => {
    fixture.componentRef.setInput('initialValues', mockSearchFormValues);
    fixture.detectChanges();
    expect(component.formValues.courtCentre).toBeTruthy();

    fixture.componentRef.setInput('initialValues', null);
    fixture.detectChanges();

    expect(component.formValues.courtCentre).toBeNull();
    expect(component.formValues.businessType).toBeNull();
    expect(component.courtroomOptions).toEqual([]);
    expect(component.startDateLabel).toBe('');
    expect(component.endDateLabel).toBe('');
  });

  it('should reset form and set null jurisdiction when clearForm is called', () => {
    component.clearForm();
    expect(component.formValues.courtCentre).toBeNull();
    expect(component.jurisdiction()).toBeNull();
  });
});
