import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { cold } from 'jasmine-marbles';
import { AppConfigService } from '../config.service';
import { CppHttp } from '@cpp/core';
import { provideMockStore } from '@ngrx/store/testing';

describe('ConfigService', () => {
  let service: AppConfigService;
  const get: jest.Mock = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        CppHttp,
        {
          provide: HttpClient,
          useValue: { get }
        },
        AppConfigService
      ]
    });

    service = TestBed.inject(AppConfigService);
  });

  it('should load all configs', () => {
    const apiRoot = 'http://apiroot';
    const idamProfilePage = 'http://idamprofile';
    const idamLogoutPage = 'http://idamlogout';

    const response$ = cold('-a|', {
      a: {
        apiRoot,
        idamProfilePage,
        idamLogoutPage
      }
    });

    get.mockReturnValue(response$);

    service.load().then(() => {
      expect(service.baseUrl).toBe(apiRoot);
    });
  });
});
