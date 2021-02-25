import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WavefrontEmbeddedChartComponent } from './wavefront-embedded-chart.component';

describe('WavefrontEmbeddedChartComponent', () => {
  let component: WavefrontEmbeddedChartComponent;
  let fixture: ComponentFixture<WavefrontEmbeddedChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WavefrontEmbeddedChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WavefrontEmbeddedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
