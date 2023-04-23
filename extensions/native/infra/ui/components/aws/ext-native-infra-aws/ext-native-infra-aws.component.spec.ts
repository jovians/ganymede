import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraAwsComponent } from './ext-native-infra-aws.component';

describe('ExtNativeInfraAwsComponent', () => {
  let component: ExtNativeInfraAwsComponent;
  let fixture: ComponentFixture<ExtNativeInfraAwsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraAwsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtNativeInfraAwsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
