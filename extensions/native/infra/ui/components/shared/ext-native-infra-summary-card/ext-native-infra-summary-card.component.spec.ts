import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraSummaryCardComponent } from './ext-native-infra-summary-card.component';

describe('ExtNativeInfraSummaryCardComponent', () => {
  let component: ExtNativeInfraSummaryCardComponent;
  let fixture: ComponentFixture<ExtNativeInfraSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraSummaryCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
