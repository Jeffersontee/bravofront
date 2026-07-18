import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceOrdersPage } from './service-orders.page';

describe('ServiceOrdersPage', () => {
  let component: ServiceOrdersPage;
  let fixture: ComponentFixture<ServiceOrdersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
