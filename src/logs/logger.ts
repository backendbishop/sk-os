import { LogEntry, LogLevel } from '../kernel/types';
import { useStore } from '../store';

let counter = 0;

// Appends a structured log entry to the store.
export function log(message: string, source = 'system', level: LogLevel = 'info'): void {
  const entry: LogEntry = {
    id: `log-${++counter}`,
    timestamp: new Date(),
    level,
    message,
    source,
  };
  useStore.getState().addLog(entry);
}
