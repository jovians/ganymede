import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterVmDetailsComponent } from './ext-native-infra-vcenter-vm-details.component';

describe('ExtNativeInfraVcenterVmDetailsComponent', () => {
  let component: ExtNativeInfraVcenterVmDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterVmDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterVmDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterVmDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
