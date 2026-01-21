import { TestBed } from '@angular/core/testing';

import { DiffService } from './diff.service';

describe('DiffService', () => {
  let service: DiffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
