import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterHostDetailsComponent } from './ext-native-infra-vcenter-host-details.component';

describe('ExtNativeInfraVcenterHostDetailsComponent', () => {
  let component: ExtNativeInfraVcenterHostDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterHostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterHostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterHostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
