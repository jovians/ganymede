/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RouteObservingService } from './route-observing.service';

describe('Service: RouteNotify', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouteObservingService]
    });
  });

  it('should ...', inject([RouteObservingService], (service: RouteObservingService) => {
    expect(service).toBeTruthy();
  }));
});
