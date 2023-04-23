import { TestBed } from '@angular/core/testing';

import { ExtNativeInfraService } from './ext-native-infra.service';

describe('ExtNativeInfraService', () => {
  let service: ExtNativeInfraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtNativeInfraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
