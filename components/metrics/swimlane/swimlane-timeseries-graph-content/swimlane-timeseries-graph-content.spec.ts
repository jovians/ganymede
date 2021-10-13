import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimlaneTimeseriesGraphContent } from './swimlane-timeseries-graph-content';

describe('SwimlaneLineGraphComponent', () => {
  let component: SwimlaneTimeseriesGraphContent;
  let fixture: ComponentFixture<SwimlaneTimeseriesGraphContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwimlaneTimeseriesGraphContent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimlaneTimeseriesGraphContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
