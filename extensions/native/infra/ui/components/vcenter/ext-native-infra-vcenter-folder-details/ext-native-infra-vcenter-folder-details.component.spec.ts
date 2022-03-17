import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraVcenterFolderDetailsComponent } from './ext-native-infra-vcenter-folder-details.component';

describe('ExtNativeInfraVcenterFolderDetailsComponent', () => {
  let component: ExtNativeInfraVcenterFolderDetailsComponent;
  let fixture: ComponentFixture<ExtNativeInfraVcenterFolderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraVcenterFolderDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraVcenterFolderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
