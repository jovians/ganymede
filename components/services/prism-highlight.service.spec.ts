import { TestBed } from '@angular/core/testing';

import { PrismHighlightService } from './prism-highlight.service';

describe('PrismHighlightService', () => {
  let service: PrismHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrismHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
