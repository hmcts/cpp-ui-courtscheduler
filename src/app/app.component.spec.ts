import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Event,
  NavigationEnd,
  NavigationStart,
  Router,
  UrlTree
} from '@angular/router';
import { Subject, of, BehaviorSubject } from 'rxjs';
import { AppState } from './core/reducers';
import { Title } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppComponent } from './app.component';
import { provideCPPApplicationEnvironment } from '@cpp/application';
import { CppHttp, provideCppCoreHttpServices } from '@cpp/core';
import { HttpResponse } from '@angular/common/http';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let mockTitleService: { getTitle: jest.Mock; setTitle: jest.Mock };
  let mockRouter: { events: Subject<Event>; parseUrl: jest.Mock };
  let mockActivatedRoute: any;
  let mockStore: MockStore<AppState>;

  const mockState = {
    config: {
      appConfig: {
        appUrl: 'http://app.url',
        apiRoot: '*',
        cppHomeUrl: '',
        idamLogoutPage: '/logout',
        idamProfilePage: '/profile',
        idamServicesPage: '/services'
      }
    },
    api: {
      requests: []
    }
  } as AppState;

  beforeEach(() => {
    mockTitleService = {
      getTitle: jest.fn().mockReturnValue('Initial title'),
      setTitle: jest.fn()
    };
    mockRouter = {
      events: new Subject<Event>(),
      parseUrl: jest.fn().mockReturnValue({} as UrlTree)
    };

    mockActivatedRoute = {
      firstChild: {
        snapshot: { data: { title: 'New title' } },
        firstChild: null
      },
      params: new BehaviorSubject({}),
      queryParams: new BehaviorSubject({})
    };

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideMockStore({ initialState: mockState }),
        provideCPPApplicationEnvironment({ production: false }),
        provideCppCoreHttpServices(),
        {
          provide: CppHttp,
          useValue: {
            get: jest.fn().mockReturnValue(of(new HttpResponse())),
            query: jest.fn().mockReturnValue(of(new HttpResponse())),
            command: jest.fn().mockReturnValue(of(new HttpResponse()))
          }
        },
        { provide: Title, useValue: mockTitleService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
  });

  it('should compile correctly', () => {
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should set page title on init', () => {
    fixture.detectChanges();

    mockRouter.events.next(new NavigationEnd(0, '/test-url', '/'));
    fixture.detectChanges();

    expect(mockTitleService.setTitle).toHaveBeenCalledWith('New title');
  });

  it('should set the page title on init when nested child route with title', () => {
    mockActivatedRoute.firstChild = {
      firstChild: {
        snapshot: { data: { title: 'Child title' } },
        firstChild: null
      },
      snapshot: { data: {} }
    };

    fixture.detectChanges();

    mockRouter.events.next(new NavigationEnd(0, '/test-url', '/'));
    fixture.detectChanges();

    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Child title');
  });

  it('should set the page title to appTitle when no route title', () => {
    mockActivatedRoute.firstChild = {
      firstChild: {
        snapshot: { data: {} },
        firstChild: null
      },
      snapshot: { data: {} }
    };

    fixture.detectChanges();

    mockRouter.events.next(new NavigationEnd(0, 'test-url', '/'));
    fixture.detectChanges();

    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Initial title');
  });

  it('should update online status to true when window goes online', () => {
    fixture.detectChanges();
    const onlineEvent = new Event('online');
    window.dispatchEvent(onlineEvent);
    expect(component.online()).toBe(true);
  });

  it('should update online status to false when window goes offline', () => {
    fixture.detectChanges();
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);
    expect(component.online()).toBe(false);
  });

  it('should emit true for hasActivity when router is navigating', () => {
    mockStore.setState({
      ...mockState,
      api: { requests: [], errors: null }
    } as AppState);
    fixture.detectChanges();

    mockRouter.events.next(new NavigationStart(1, '/test-url'));
    fixture.detectChanges();

    expect(component.hasActivity()).toBe(true);
    expect(component.hasNavigationActivity()).toBe(true);
    expect(fixture).toMatchSnapshot();
  });

  it('should emit true for hasActivity when API activity', () => {
    mockStore.setState({
      ...mockState,
      api: { requests: [{ url: 'test-url', requestType: 'GET' }], errors: null }
    } as AppState);
    fixture.detectChanges();

    expect(component.hasActivity()).toBe(true);
    expect(fixture).toMatchSnapshot();
  });
});
