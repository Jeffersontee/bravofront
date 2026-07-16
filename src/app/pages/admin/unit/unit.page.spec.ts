import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitPage } from './unit.page';

describe('UnitPage', () => {
  let component: UnitPage;
  let fixture: ComponentFixture<UnitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
