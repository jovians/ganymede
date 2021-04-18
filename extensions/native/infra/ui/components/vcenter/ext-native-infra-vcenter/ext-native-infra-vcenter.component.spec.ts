import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterComponent } from './ext-native-infra-vcenter.component';

describe('ExtNativeInfraVcenterComponent', () => {
  let component: ExtNativeInfraVcenterComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
