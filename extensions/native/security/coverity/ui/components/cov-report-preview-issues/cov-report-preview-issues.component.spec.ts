import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CovReportPreviewIssuesComponent } from './cov-report-preview-issues.component';

describe('CovReportPreviewIssuesComponent', () => {
  let component: CovReportPreviewIssuesComponent;
  let fixture: ComponentFixture<CovReportPreviewIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CovReportPreviewIssuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CovReportPreviewIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
