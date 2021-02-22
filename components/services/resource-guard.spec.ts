import { TestBed } from '@angular/core/testing';

import { ResourceGuard } from './resource-guard';

describe('ResourceGuardService', () => {
  let service: ResourceGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
