import { Command } from '../types';

export const open: Command = {
  name: 'open',
  description: 'Launch an application',
  usage: 'open <app>',
  execute(args, ctx) {
    if (!args[0]) return { output: 'open: missing operand', error: true };
    ctx.openApp(args[0]);
    return { output: `Launching ${args[0]}...` };
  },
};
