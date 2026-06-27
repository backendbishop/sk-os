import { Command } from '../types';

export const cd: Command = {
  name: 'cd',
  description: 'Change working directory',
  usage: 'cd <path>',
  execute(args, ctx) {
    if (!args[0]) return { output: '' };
    const path = ctx.vfs.resolvePath(ctx.cwd, args[0]);
    const node = ctx.vfs.resolve(path);
    if (!node) return { output: `cd: ${path}: no such file or directory`, error: true };
    if (node.type !== 'directory') return { output: `cd: ${path}: not a directory`, error: true };
    ctx.setCwd(path);
    return { output: '' };
  },
};
