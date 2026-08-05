import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { withStoreRouter } from '../with-store-router.feature';
import { ExtractSignalStoreFeatureResult } from '../../../../shared/types/signal-test-types';

describe('withStoreRouter', () => {
  let store: ExtractSignalStoreFeatureResult<ReturnType<typeof withStoreRouter>>;
  let router: Router;

  beforeEach(() => {
    const TestStore = signalStore(withState({}), withStoreRouter());

    TestBed.configureTestingModule({
      providers: [TestStore, provideRouter([])],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(TestStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create store with navigateTo method', () => {
    expect.assertions(2);
    expect(store.navigateTo).toBeDefined();
    expect(typeof store.navigateTo).toBe('function');
  });

  it('should create store with navigateByUrlTo method', () => {
    expect.assertions(2);
    expect(store.navigateByUrlTo).toBeDefined();
    expect(typeof store.navigateByUrlTo).toBe('function');
  });

  it('should call router.navigate when navigateTo is called', () => {
    expect.assertions(1);

    const navigateSpy = jest.spyOn(router, 'navigate');
    const routes = ['path1', 'path2'];

    store.navigateTo(routes);

    expect(navigateSpy).toHaveBeenCalledWith(routes);
  });

  it('should call router.navigateByUrl when navigateByUrlTo is called', () => {
    expect.assertions(1);

    const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl');
    const url = '/test-url';

    store.navigateByUrlTo(url);

    expect(navigateByUrlSpy).toHaveBeenCalledWith(url);
  });
});
