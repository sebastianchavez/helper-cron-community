import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

// ng test always runs in Angular dev mode, so isDevMode() returns true.
// Production-mode (isDevMode() === false) suppression is covered by code review.
describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('log() should call console.log with id and functionName', () => {
    const spy = spyOn(console, 'log');
    service.log('ID1', 'myFunc', { info: 'test message' });
    expect(spy).toHaveBeenCalled();
    const firstArg: string = spy.calls.mostRecent().args[0];
    expect(firstArg).toContain('ID1');
    expect(firstArg).toContain('myFunc');
  });

  it('log() should pass the info string as second argument', () => {
    const spy = spyOn(console, 'log');
    service.log('ID1', 'fn', { info: 'hello world' });
    expect(spy.calls.mostRecent().args[1]).toBe('hello world');
  });

  it('log() should include a timestamp in the metadata object', () => {
    const spy = spyOn(console, 'log');
    service.log('ID5', 'fn', { info: 'ts check' });
    const meta = spy.calls.mostRecent().args[2];
    expect(meta.timestamp).toBeDefined();
  });

  it('warn() should call console.warn with id and functionName', () => {
    const spy = spyOn(console, 'warn');
    service.warn('ID2', 'warnFunc', { info: 'warn message', error: new Error('err') });
    expect(spy).toHaveBeenCalled();
    const firstArg: string = spy.calls.mostRecent().args[0];
    expect(firstArg).toContain('ID2');
    expect(firstArg).toContain('warnFunc');
  });

  it('error() should call console.error with id and functionName', () => {
    const spy = spyOn(console, 'error');
    service.error('ID3', 'errFunc', { info: 'error msg', error: new Error('fail') });
    expect(spy).toHaveBeenCalled();
    const firstArg: string = spy.calls.mostRecent().args[0];
    expect(firstArg).toContain('ID3');
    expect(firstArg).toContain('errFunc');
  });

  it('logWithEmoji() should call console.log with emoji prefix', () => {
    const spy = spyOn(console, 'log');
    service.logWithEmoji('ID4', 'myFunc', { info: 'emoji log' }, '🚀');
    expect(spy).toHaveBeenCalled();
    const firstArg: string = spy.calls.mostRecent().args[0];
    expect(firstArg).toContain('🚀');
    expect(firstArg).toContain('ID4');
  });
});
