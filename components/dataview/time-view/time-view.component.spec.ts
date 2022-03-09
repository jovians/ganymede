import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeViewComponent } from './time-view.component';

describe('TimeViewComponent', () => {
  let component: TimeViewComponent;
  let fixture: ComponentFixture<TimeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
