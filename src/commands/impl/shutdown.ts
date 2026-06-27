import { Command } from '../types';

export const shutdown: Command = {
  name: 'shutdown',
  description: 'Shut down the system',
  usage: 'shutdown',
  execute(_, ctx) {
    ctx.emit('SHUTDOWN_INITIATED', 'terminal');
    return { output: 'Shutting down...' };
  },
};
