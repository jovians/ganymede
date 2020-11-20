import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdContentsComponent } from './md-contents.component';

describe('MdContentsComponent', () => {
  let component: MdContentsComponent;
  let fixture: ComponentFixture<MdContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdContentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
