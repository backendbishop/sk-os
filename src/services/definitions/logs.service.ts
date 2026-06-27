import { Service } from '../../kernel/types';

export const logsService: Service = {
  id: 'logs.service',
  name: 'Logs Service',
  status: 'active',
  description: 'Appends structured log entries to system log. Subscribed to kernel events.',
  architecture: 'Event bus subscriber. On any system event, formats and appends a LogEntry to store. Append-only.',
  tradeoffs: [
    'In-memory log — lost on reload (intentional; this is a session log).',
    'Append-only — no mutation, consistent with audit log principles.',
  ],
};
