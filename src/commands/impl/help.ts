import { Command } from '../types';
import { registry } from '../registry';

export const help: Command = {
  name: 'help',
  description: 'List available commands',
  usage: 'help [command]',
  execute(args) {
    if (args[0]) {
      const cmd = registry.get(args[0]);
      if (!cmd) return { output: `help: unknown command: ${args[0]}`, error: true };
      return { output: `${cmd.name}\n  ${cmd.description}\n  usage: ${cmd.usage}` };
    }
    const lines = registry.all().map(c => `  ${c.name.padEnd(12)} ${c.description}`);
    return { output: ['Commands:', ...lines].join('\n') };
  },
};
