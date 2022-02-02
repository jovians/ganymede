import { TestBed } from '@angular/core/testing';

import { XtermService } from './xterm.service';

describe('XtermService', () => {
  let service: XtermService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XtermService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
