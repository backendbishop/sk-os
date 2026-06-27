import { Command } from '../types';

export const services: Command = {
  name: 'services',
  description: 'List registered services',
  usage: 'services',
  execute(_, ctx) {
    if (ctx.cwd !== '/') return {
      output: `services: command not available outside /\n  hint: cd /`,
      error: true,
    };
    const svcs = ctx.kernel.getServices();
    if (svcs.length === 0) return { output: 'No services registered.' };
    const header = '  STATUS    NAME';
    const divider = '  ' + '─'.repeat(30);
    const lines = svcs.map(s => `  ${s.status.padEnd(10)}${s.name}`);
    return { output: [header, divider, ...lines].join('\n') };
  },
};
