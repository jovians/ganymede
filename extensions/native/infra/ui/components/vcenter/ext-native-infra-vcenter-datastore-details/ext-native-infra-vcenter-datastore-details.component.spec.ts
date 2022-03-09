import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterDatastoreDetailsComponent } from './ext-native-infra-vcenter-datastore-details.component';

describe('ExtNativeInfraVcenterDatastoreDetailsComponent', () => {
  let component: ExtNativeInfraVcenterDatastoreDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterDatastoreDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterDatastoreDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterDatastoreDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
