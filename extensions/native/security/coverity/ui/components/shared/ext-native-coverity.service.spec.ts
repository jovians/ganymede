import { TestBed } from '@angular/core/testing';

import { ExtNativeCoverityService } from './ext-native-coverity.service';

describe('ExtNativeCoverityService', () => {
  let service: ExtNativeCoverityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtNativeCoverityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
