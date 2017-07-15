import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetLocationComponent } from './get-location.component';

describe('GetLocationComponent', () => {
  let component: GetLocationComponent;
  let fixture: ComponentFixture<GetLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
