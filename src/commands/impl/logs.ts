import { Command } from '../types';
import { useStore } from '../../store';

export const logs: Command = {
  name: 'logs',
  description: 'View system log',
  usage: 'logs',
  execute(_, ctx) {
    if (ctx.cwd !== '/') return {
      output: `logs: command not available outside /\n  hint: cd /`,
      error: true,
    };
    const entries = useStore.getState().logs;
    if (entries.length === 0) return { output: 'No log entries.' };
    const lines = entries.map(e => {
      const ts = e.timestamp.toLocaleString('en-KE', {
        timeZone: 'Africa/Nairobi',
        hour12: false,
      });
      return `  ${ts}  [${e.level.toUpperCase().padEnd(6)}]  ${e.source.padEnd(12)}  ${e.message}`;
    });
    return { output: lines.join('\n') };
  },
};
