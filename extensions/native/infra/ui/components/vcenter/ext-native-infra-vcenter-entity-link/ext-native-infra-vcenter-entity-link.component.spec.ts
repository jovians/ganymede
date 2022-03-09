import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterEntityLinkComponent } from './ext-native-infra-vcenter-entity-link.component';

describe('ExtNativeInfraVcenterEntityLinkComponent', () => {
  let component: ExtNativeInfraVcenterEntityLinkComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterEntityLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterEntityLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterEntityLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
