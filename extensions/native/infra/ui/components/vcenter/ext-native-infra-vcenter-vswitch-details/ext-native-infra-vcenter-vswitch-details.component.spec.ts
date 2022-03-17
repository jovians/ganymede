import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterVswitchDetailsComponent } from './ext-native-infra-vcenter-vswitch-details.component';

describe('ExtNativeInfraVcenterVswitchDetailsComponent', () => {
  let component: ExtNativeInfraVcenterVswitchDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterVswitchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterVswitchDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterVswitchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
