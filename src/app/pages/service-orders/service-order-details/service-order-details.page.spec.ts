import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceOrderDetailsPage } from './service-order-details.page';

describe('ServiceOrderDetailsPage', () => {
  let component: ServiceOrderDetailsPage;
  let fixture: ComponentFixture<ServiceOrderDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOrderDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
