import { TestBed } from '@angular/core/testing';

import { InputEventService } from './input-event.service';

describe('InputEventService', () => {
  let service: InputEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
