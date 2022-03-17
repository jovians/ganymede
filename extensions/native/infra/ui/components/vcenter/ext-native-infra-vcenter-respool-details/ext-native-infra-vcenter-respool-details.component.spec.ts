import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterRespoolDetailsComponent } from './ext-native-infra-vcenter-respool-details.component';

describe('ExtNativeInfraVcenterRespoolDetailsComponent', () => {
  let component: ExtNativeInfraVcenterRespoolDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterRespoolDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterRespoolDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterRespoolDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
