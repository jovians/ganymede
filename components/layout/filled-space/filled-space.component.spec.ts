import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilledSpaceComponent } from './filled-space.component';

describe('FilledSpaceComponent', () => {
  let component: FilledSpaceComponent;
  let fixture: ComponentFixture<FilledSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilledSpaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilledSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
