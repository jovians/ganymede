import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanyGridComponent } from './gany-grid.component';

describe('GanyGridComponent', () => {
  let component: GanyGridComponent;
  let fixture: ComponentFixture<GanyGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GanyGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GanyGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
