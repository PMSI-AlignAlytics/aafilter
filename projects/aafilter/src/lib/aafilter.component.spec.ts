import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AafilterComponent } from './aafilter.component';

describe('AafilterComponent', () => {
  let component: AafilterComponent;
  let fixture: ComponentFixture<AafilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AafilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AafilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
