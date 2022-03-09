import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimlaneAdvUtilGaugeComponent } from './swimlane-adv-util-gauge.component';

describe('SwimlaneAdvUtilGaugeComponent', () => {
  let component: SwimlaneAdvUtilGaugeComponent;
  let fixture: ComponentFixture<SwimlaneAdvUtilGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwimlaneAdvUtilGaugeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimlaneAdvUtilGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
