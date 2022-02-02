import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CovReportPreviewPageComponent } from './cov-report-preview-page.component';

describe('CovReportPreviewPageComponent', () => {
  let component: CovReportPreviewPageComponent;
  let fixture: ComponentFixture<CovReportPreviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CovReportPreviewPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CovReportPreviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
