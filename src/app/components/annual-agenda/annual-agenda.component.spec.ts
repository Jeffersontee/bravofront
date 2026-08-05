import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnualAgendaComponent } from './annual-agenda.component';

describe('AnnualAgendaComponent', () => {
  let component: AnnualAgendaComponent;
  let fixture: ComponentFixture<AnnualAgendaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AnnualAgendaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnualAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
