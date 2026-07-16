import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ServiceFormComponent } from './service-form.component';

describe('ServiceFormComponent', () => {
  let component: ServiceFormComponent;
  let fixture: ComponentFixture<ServiceFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ServiceFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
