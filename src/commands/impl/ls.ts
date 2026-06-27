import { Command } from '../types';

export const ls: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [path]',
  execute(args, ctx) {
    const path = args[0] ? ctx.vfs.resolvePath(ctx.cwd, args[0]) : ctx.cwd;
    const nodes = ctx.vfs.ls(path);
    if (!nodes) return { output: `ls: ${path}: not a directory`, error: true };
    if (nodes.length === 0) return { output: '' };
    const lines = nodes.map(n => `  ${n.type === 'directory' ? n.name + '/' : n.name}`);
    return { output: lines.join('\n') };
  },
};
