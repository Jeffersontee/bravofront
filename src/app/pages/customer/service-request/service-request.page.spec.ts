import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceRequestPage } from './service-request.page';

describe('ServiceRequestPage', () => {
  let component: ServiceRequestPage;
  let fixture: ComponentFixture<ServiceRequestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
