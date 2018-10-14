import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPipesComponent } from './dashboard-pipes.component';

describe('DashboardPipesComponent', () => {
  let component: DashboardPipesComponent;
  let fixture: ComponentFixture<DashboardPipesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardPipesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
