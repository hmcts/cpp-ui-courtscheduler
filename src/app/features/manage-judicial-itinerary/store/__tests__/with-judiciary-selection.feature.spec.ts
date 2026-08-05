import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { withJudiciarySelection } from '../with-judiciary-selection.feature';
import { ExtractSignalStoreFeatureResult } from '../../../../shared/types/signal-test-types';
import { JudiciaryWithSpecialisms } from '../../model/judicial-itinerary.interface';
import { Specialism } from '../../model/specialism.enum';

describe('withJudiciarySelection', () => {
  let store: ExtractSignalStoreFeatureResult<ReturnType<typeof withJudiciarySelection>>;

  const mockJudiciary: JudiciaryWithSpecialisms = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
  } as unknown as JudiciaryWithSpecialisms;

  const mockJudiciaryWithoutSpecialisms: JudiciaryWithSpecialisms = {
    id: 'judge-2',
    seqId: 2,
    surname: 'Doe',
    forenames: 'Jane',
    judiciaryType: 'District Judge',
    emailAddress: 'jane.doe@example.com'
  } as unknown as JudiciaryWithSpecialisms;

  beforeEach(() => {
    const TestStore = signalStore(withState({}), withJudiciarySelection());

    TestBed.configureTestingModule({
      providers: [TestStore],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(TestStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have initial state with null selectedType and selectedJudiciary', () => {
      expect.assertions(2);
      expect(store.selectedType()).toBeNull();
      expect(store.selectedJudiciary()).toBeNull();
    });

    it('should have empty selectedSpecialisms initially', () => {
      expect.assertions(1);
      expect(store.selectedJudiciarySpecialisms()).toEqual([]);
    });
  });

  describe('setSelectedJudiciary', () => {
    it('should update selectedJudiciary', () => {
      expect.assertions(2);
      store.setSelectedJudiciary(mockJudiciary);
      expect(store.selectedJudiciary()).toEqual(mockJudiciary);
      expect(store.selectedType()).toEqual('Judge');
    });

    it('should handle null judiciary', () => {
      expect.assertions(2);
      store.setSelectedJudiciary(mockJudiciary);
      store.setSelectedJudiciary(null);
      expect(store.selectedJudiciary()).toBeNull();
      expect(store.selectedType()).toBeNull();
    });
  });

  describe('clearJudiciarySelection', () => {
    it('should reset selectedType and selectedJudiciary to null', () => {
      expect.assertions(2);
      store.setSelectedJudiciary(mockJudiciary);

      store.clearJudiciarySelection();

      expect(store.selectedType()).toBeNull();
      expect(store.selectedJudiciary()).toBeNull();
    });
  });

  describe('selectedSpecialisms computed', () => {
    it('should return specialisms from selectedJudiciary', () => {
      expect.assertions(1);
      store.setSelectedJudiciary(mockJudiciary);
      expect(store.selectedJudiciarySpecialisms()).toEqual([
        Specialism.MURDER,
        Specialism.ATTEMPTEDMURDER
      ]);
    });

    it('should return empty array when judiciary is null', () => {
      expect.assertions(1);
      store.setSelectedJudiciary(null);
      expect(store.selectedJudiciarySpecialisms()).toEqual([]);
    });

    it('should return empty array when judiciary has no specialisms', () => {
      expect.assertions(1);
      store.setSelectedJudiciary(mockJudiciaryWithoutSpecialisms);
      expect(store.selectedJudiciarySpecialisms()).toEqual([]);
    });

    it('should return empty array when specialisms is undefined', () => {
      expect.assertions(1);
      const judiciaryWithUndefinedSpecialisms: JudiciaryWithSpecialisms = {
        ...mockJudiciaryWithoutSpecialisms,
        specialisms: undefined
      };
      store.setSelectedJudiciary(judiciaryWithUndefinedSpecialisms);
      expect(store.selectedJudiciarySpecialisms()).toEqual([]);
    });
  });
});
