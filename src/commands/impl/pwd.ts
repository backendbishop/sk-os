import { Command } from '../types';

export const pwd: Command = {
  name: 'pwd',
  description: 'Print working directory',
  usage: 'pwd',
  execute(_, ctx) {
    return { output: ctx.cwd };
  },
};
