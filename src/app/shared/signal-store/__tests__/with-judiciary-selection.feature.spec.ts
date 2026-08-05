import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { withJudiciarySelection } from '..';
import { ExtractSignalStoreFeatureResult } from '../../types/signal-test-types';
import { ExtendedJudicialMember } from '../../model';
import { Specialism } from '@cpp/reference-data';

describe('withJudiciarySelection', () => {
  let store: ExtractSignalStoreFeatureResult<ReturnType<typeof withJudiciarySelection>>;

  const mockJudiciary: ExtendedJudicialMember = {
    id: 'judge-1',
    seqId: 1,
    surname: 'Smith',
    forenames: 'John',
    judiciaryType: 'Circuit Judge',
    emailAddress: 'john.smith@example.com',
    specialisms: [Specialism.MURDER, Specialism.ATTEMPTEDMURDER]
  } as unknown as ExtendedJudicialMember;

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
    it('should have initial state with null selectedJudiciaryTypes and selectedJudiciary', () => {
      expect.assertions(2);
      expect(store.selectedJudiciaryTypes()).toBeNull();
      expect(store.selectedJudiciaries()).toBeNull();
    });
  });

  describe('setSelectedJudiciary', () => {
    it('should update selectedJudiciary', () => {
      expect.assertions(2);
      store.setSelectedJudiciary([mockJudiciary]);
      expect(store.selectedJudiciaries()).toEqual([mockJudiciary]);
      expect(store.selectedJudiciaryTypes()).toEqual(['Judge']);
    });

    it('should handle null judiciary', () => {
      expect.assertions(2);
      store.setSelectedJudiciary([mockJudiciary]);
      store.setSelectedJudiciary(null);
      expect(store.selectedJudiciaries()).toBeNull();
      expect(store.selectedJudiciaryTypes()).toBeNull();
    });
  });

  describe('clearJudiciarySelection', () => {
    it('should reset selectedType and selectedJudiciary to null', () => {
      expect.assertions(2);
      store.setSelectedJudiciary([mockJudiciary]);

      store.clearJudiciarySelection();

      expect(store.selectedJudiciaryTypes()).toBeNull();
      expect(store.selectedJudiciaries()).toBeNull();
    });
  });
});
