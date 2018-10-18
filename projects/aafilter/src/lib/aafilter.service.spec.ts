import { TestBed } from '@angular/core/testing';

import { AafilterService } from './aafilter.service';

describe('AafilterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AafilterService = TestBed.get(AafilterService);
    expect(service).toBeTruthy();
  });
});
