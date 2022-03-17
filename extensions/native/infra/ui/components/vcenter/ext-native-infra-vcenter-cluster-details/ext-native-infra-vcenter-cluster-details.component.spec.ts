import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterClusterDetailsComponent } from './ext-native-infra-vcenter-cluster-details.component';

describe('ExtNativeInfraVcenterClusterDetailsComponent', () => {
  let component: ExtNativeInfraVcenterClusterDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterClusterDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterClusterDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterClusterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
