import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicContentsComponent } from './basic-contents.component';

describe('BasicContentsComponent', () => {
  let component: BasicContentsComponent;
  let fixture: ComponentFixture<BasicContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicContentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
