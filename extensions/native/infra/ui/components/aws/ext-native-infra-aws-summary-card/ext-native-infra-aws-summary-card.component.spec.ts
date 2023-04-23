import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraAwsSummaryCardComponent } from './ext-native-infra-aws-summary-card.component';

describe('ExtNativeInfraAwsSummaryCardComponent', () => {
  let component: ExtNativeInfraAwsSummaryCardComponent;
  let fixture: ComponentFixture<ExtNativeInfraAwsSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraAwsSummaryCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraAwsSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
