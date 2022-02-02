import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimlaneAdvPieChartComponent } from './swimlane-adv-pie-chart.component';

describe('SwimlaneAdvPieChartComponent', () => {
  let component: SwimlaneAdvPieChartComponent;
  let fixture: ComponentFixture<SwimlaneAdvPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwimlaneAdvPieChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimlaneAdvPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
