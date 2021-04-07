import { TestBed } from '@angular/core/testing';

import { RouteReuser } from './route-reuser';

describe('RouteReuser', () => {
  let service: RouteReuser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteReuser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
