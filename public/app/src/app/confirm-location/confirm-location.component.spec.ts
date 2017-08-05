import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmLocationComponent } from './confirm-location.component';

describe('ConfirmLocationComponent', () => {
  let component: ConfirmLocationComponent;
  let fixture: ComponentFixture<ConfirmLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
