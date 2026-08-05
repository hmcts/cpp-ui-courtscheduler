import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JudicialItineraryResultsComponent } from '../judicial-itinerary-results/judicial-itinerary-results.component';
import { Itinerary } from '../../model/judicial-itinerary.interface';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';
import { SortOrder } from '@cpp/pdk';
import { ItinerarySortField } from '../../store/manage-judiciary-itinerary.store.interfaces';
import { Component } from '@angular/core';

@Component({
  selector: 'app-test-host',
  template: `
    <judicial-itinerary-results
      [itineraries]="itineraries"
      [totalResults]="totalResults"
      [page]="page"
      [pageSize]="pageSize"
      [sortField]="sortField"
      [sortOrder]="sortOrder"
      (onAddJudiciary)="handleAddJudiciary()"
      (onEdit)="handleEdit($event)"
      (onRemove)="handleRemove($event)"
      (onSort)="handleSort($event)"
    ></judicial-itinerary-results>
  `,
  imports: [JudicialItineraryResultsComponent]
})
class TestHostComponent {
  itineraries: Itinerary[] = [];
  totalResults = 0;
  page = 1;
  pageSize = 20;
  sortField: ItinerarySortField | null = null;
  sortOrder: SortOrder | null = null;
  addJudiciaryCalled = false;
  editItinerary?: { itinerary: Itinerary };
  removeItinerary?: Itinerary;
  sortEvent?: { field: ItinerarySortField; order: SortOrder };

  handleAddJudiciary(): void {
    this.addJudiciaryCalled = true;
  }

  handleEdit(event: { itinerary: Itinerary }): void {
    this.editItinerary = event;
  }

  handleRemove(itinerary: Itinerary): void {
    this.removeItinerary = itinerary;
  }

  handleSort(event: { field: ItinerarySortField; order: SortOrder }): void {
    this.sortEvent = event;
  }
}

describe('JudicialItineraryResultsComponent', () => {
  let component: JudicialItineraryResultsComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  const mockJudiciaryMember: JudiciaryWithSpecialisms = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER]
  } as unknown as JudiciaryWithSpecialisms;

  const mockItinerary: Itinerary = {
    id: 'rule-1',
    courtHouseId: 'court-1',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    sessionType: 'AD',
    repeatDays: ['Monday'],
    unavailabilities: [],
    judiciaryMember: mockJudiciaryMember
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(JudicialItineraryResultsComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect.assertions(1);
    expect(component).toBeTruthy();
  });

  it('should render correctly', () => {
    expect.assertions(1);

    testHost.itineraries = [mockItinerary];
    testHost.totalResults = 25;
    testHost.page = 1;
    testHost.pageSize = 20;
    testHost.sortField = 'name';
    testHost.sortOrder = 'asc';
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should compute hasPagination as true when totalResults is greater than pageSize', () => {
    expect.assertions(1);

    testHost.totalResults = 25;
    testHost.pageSize = 20;
    fixture.detectChanges();

    expect(component.hasPagination()).toBe(true);
  });

  it('should compute hasPagination as false when totalResults is less than or equal to pageSize', () => {
    expect.assertions(2);

    testHost.totalResults = 20;
    testHost.pageSize = 20;
    fixture.detectChanges();
    expect(component.hasPagination()).toBe(false);

    testHost.totalResults = 15;
    fixture.detectChanges();
    expect(component.hasPagination()).toBe(false);
  });

  it('should compute typeSortDirection correctly', () => {
    expect.assertions(3);

    testHost.sortField = 'type';
    testHost.sortOrder = 'asc';
    fixture.detectChanges();
    expect(component.typeSortDirection()).toBe('asc');

    testHost.sortOrder = 'desc';
    fixture.detectChanges();
    expect(component.typeSortDirection()).toBe('desc');

    testHost.sortField = 'name';
    fixture.detectChanges();
    expect(component.typeSortDirection()).toBe('none');
  });

  it('should compute nameSortDirection correctly', () => {
    expect.assertions(4);

    testHost.sortField = 'name';
    testHost.sortOrder = 'asc';
    fixture.detectChanges();
    expect(component.nameSortDirection()).toBe('asc');

    testHost.sortOrder = 'desc';
    fixture.detectChanges();
    expect(component.nameSortDirection()).toBe('desc');

    testHost.sortField = 'name';
    testHost.sortOrder = null;
    fixture.detectChanges();
    expect(component.nameSortDirection()).toBe('none');

    testHost.sortField = 'type';
    fixture.detectChanges();
    expect(component.nameSortDirection()).toBe('none');
  });

  it('should compute specialismSortDirection correctly', () => {
    expect.assertions(4);

    testHost.sortField = 'specialism';
    testHost.sortOrder = 'asc';
    fixture.detectChanges();
    expect(component.specialismSortDirection()).toBe('asc');

    testHost.sortOrder = 'desc';
    fixture.detectChanges();
    expect(component.specialismSortDirection()).toBe('desc');

    testHost.sortField = 'specialism';
    testHost.sortOrder = null;
    fixture.detectChanges();
    expect(component.specialismSortDirection()).toBe('none');

    testHost.sortField = 'type';
    fixture.detectChanges();
    expect(component.specialismSortDirection()).toBe('none');
  });

  it('should return "none" when sortOrder is null', () => {
    expect.assertions(1);

    testHost.sortField = 'type';
    testHost.sortOrder = null;
    fixture.detectChanges();

    expect(component.typeSortDirection()).toBe('none');
  });

  it('should emit onAddJudiciary when handleAddJudiciary is called', () => {
    expect.assertions(1);

    component.handleAddJudiciary();
    fixture.detectChanges();

    expect(testHost.addJudiciaryCalled).toBe(true);
  });

  it('should emit onEdit with itinerary when handleEdit is called', () => {
    expect.assertions(1);

    fixture.detectChanges();

    component.handleEdit(mockItinerary);
    fixture.detectChanges();

    expect(testHost.editItinerary).toEqual({ itinerary: mockItinerary });
  });

  it('should emit onRemove with itinerary when handleRemove is called', () => {
    expect.assertions(1);

    component.handleRemove(mockItinerary);
    fixture.detectChanges();

    expect(testHost.removeItinerary).toEqual(mockItinerary);
  });

  it('should emit onSort with field and order when handleSort is called', () => {
    expect.assertions(1);

    const field: ItinerarySortField = 'name';
    const order: SortOrder = 'asc';

    component.handleSort(field, order);
    fixture.detectChanges();

    expect(testHost.sortEvent).toEqual({ field, order });
  });

  it('should update page model when pagination changes', () => {
    expect.assertions(2);

    testHost.page = 1;
    fixture.detectChanges();

    expect(component.page()).toBe(1);

    component.page.set(2);
    fixture.detectChanges();

    expect(component.page()).toBe(2);
  });

  it('should display empty state when itineraries is empty', () => {
    expect.assertions(1);

    testHost.itineraries = [];
    testHost.totalResults = 0;
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('[data-test-id="judiciary-list"]');
    expect(table).toBeNull();
  });

  it('should compute sort directions correctly when sortField is null', () => {
    expect.assertions(3);

    testHost.sortField = null;
    testHost.sortOrder = null;
    fixture.detectChanges();

    expect(component.typeSortDirection()).toBe('none');
    expect(component.nameSortDirection()).toBe('none');
    expect(component.specialismSortDirection()).toBe('none');
  });

  it('should handle pagination correctly when totalResults equals pageSize', () => {
    expect.assertions(1);

    testHost.totalResults = 20;
    testHost.pageSize = 20;
    fixture.detectChanges();

    expect(component.hasPagination()).toBe(false);
  });
});
