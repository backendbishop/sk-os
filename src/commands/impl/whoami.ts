import { Command } from '../types';

export const whoami: Command = {
  name: 'whoami',
  description: 'Display user identity',
  usage: 'whoami',
  execute(_args, ctx) {
    const content = ctx.vfs.cat('/about');

    if (content === undefined) {
      return {
        output: [
          'guest@sk-os',
          '',
          'No /about file found.',
          "Create one in src/filesystem/tree.ts to personalize this output.",
        ].join('\n'),
      };
    }

    if (typeof content === 'string') {
      return { output: content };
    }

    return { output: JSON.stringify(content, null, 2) };
  },
};
