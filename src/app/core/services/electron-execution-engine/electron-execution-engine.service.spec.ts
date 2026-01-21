import { TestBed } from '@angular/core/testing';

import { ElectronExecutionEngineService } from './electron-execution-engine.service';

describe('ElectronExecutionEngineService', () => {
  let service: ElectronExecutionEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectronExecutionEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
