import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterSummaryCardComponent } from './ext-native-infra-vcenter-summary-card.component';

describe('ExtNativeInfraSummaryCardComponent', () => {
  let component: ExtNativeInfraVcenterSummaryCardComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterSummaryCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
