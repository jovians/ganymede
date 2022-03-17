import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterNetworkDetailsComponent } from './ext-native-infra-vcenter-network-details.component';

describe('ExtNativeInfraVcenterNetworkDetailsComponent', () => {
  let component: ExtNativeInfraVcenterNetworkDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterNetworkDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterNetworkDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterNetworkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
