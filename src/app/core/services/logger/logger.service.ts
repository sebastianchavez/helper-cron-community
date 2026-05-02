import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

interface LogInfo {
  info: string;
  response?: any;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  
  constructor() { }

  /**
   * Logs info level messages. Only shown in development mode.
   * @param idLog - Unique identifier for the log entry
   * @param functionName - Name of the function where the log is called
   * @param info - Object containing info message and optional response/error data
   */
  log(idLog: string, functionName: string, info: LogInfo): void {
    if (isDevMode()) {
      console.log(`[${idLog}] [${functionName}]`, info.info, {
        response: info.response,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logs warning level messages. Only shown in development mode.
   * @param idLog - Unique identifier for the log entry
   * @param functionName - Name of the function where the log is called
   * @param info - Object containing info message and optional response/error data
   */
  warn(idLog: string, functionName: string, info: LogInfo): void {
    if (isDevMode()) {
      console.warn(`[${idLog}] [${functionName}]`, info.info, {
        response: info.response,
        error: info.error,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logs error level messages. Only shown in development mode.
   * @param idLog - Unique identifier for the log entry
   * @param functionName - Name of the function where the log is called
   * @param info - Object containing info message and optional response/error data
   */
  error(idLog: string, functionName: string, info: LogInfo): void {
    if (isDevMode()) {
      console.error(`[${idLog}] [${functionName}]`, info.info, {
        response: info.response,
        error: info.error,
        timestamp: new Date().toISOString()
      });
    }
  }

  logWithEmoji(idLog: string, functionName: string, info: LogInfo, emoji: string = ''): void {
    if (isDevMode()) {
      console.log(`${emoji} [${idLog}] [${functionName}]`, info.info, {
        response: info.response,
        timestamp: new Date().toISOString()
      });
    }
  }
}