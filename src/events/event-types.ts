// All system events. Every cross-module interaction goes through these.

export type EventType =
  | 'KERNEL_READY'
  | 'APP_STARTED'
  | 'APP_FOCUSED'
  | 'APP_CLOSED'
  | 'PROCESS_REGISTERED'
  | 'PROCESS_KILLED'
  | 'SERVICE_REGISTERED'
  | 'SERVICE_STOPPED'
  | 'FILE_OPENED'
  | 'FILE_READ'
  | 'TERMINAL_COMMAND'
  | 'LOG_WRITTEN'
  | 'SEARCH_EXECUTED'
  | 'SHUTDOWN_INITIATED';

export interface SystemEvent {
  type: EventType;
  payload?: unknown;
  timestamp: Date;
  source: string; // module that emitted the event
}
