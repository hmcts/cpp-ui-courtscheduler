import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectJurisdictionComponent } from './select-jurisdiction.component';
import { JurisdictionType } from '../../model/jurisdiction';

describe('SelectJurisdictionComponent', () => {
  let component: SelectJurisdictionComponent;
  let fixture: ComponentFixture<SelectJurisdictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectJurisdictionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectJurisdictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should render magistrates jurisdiction when selected', () => {
    component.jurisdiction.set(JurisdictionType.MAGISTRATES);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render crown jurisdiction when selected', () => {
    component.jurisdiction.set(JurisdictionType.CROWN);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
