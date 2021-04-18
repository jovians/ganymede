import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtNativeInfraPageComponent } from './ext-native-infra-page.component';

describe('ExtNativeInfraPageComponent', () => {
  let component: ExtNativeInfraPageComponent;
  let fixture: ComponentFixture<ExtNativeInfraPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtNativeInfraPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtNativeInfraPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
