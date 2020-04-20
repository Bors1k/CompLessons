import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachProfileComponent } from './teach-profile.component';

describe('TeachProfileComponent', () => {
  let component: TeachProfileComponent;
  let fixture: ComponentFixture<TeachProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeachProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
