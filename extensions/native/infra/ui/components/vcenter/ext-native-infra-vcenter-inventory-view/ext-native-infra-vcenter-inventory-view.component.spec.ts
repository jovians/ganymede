import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterInventoryViewComponent } from './ext-native-infra-vcenter-inventory-view.component';

describe('ExtNativeInfraVcenterInventoryViewComponent', () => {
  let component: ExtNativeInfraVcenterInventoryViewComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterInventoryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterInventoryViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterInventoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
