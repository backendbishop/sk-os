import { Command } from '../types';
import { isManifest, isDecision, isService } from '../../filesystem/nodes';

export const search: Command = {
  name: 'search',
  description: 'Search across the filesystem',
  usage: 'search <query>',
  execute(args, ctx) {
    if (!args[0]) return { output: 'search: missing query', error: true };
    const query = args.join(' ').toLowerCase();
    const results: string[] = [];

    for (const [path, node] of ctx.vfs.walk()) {
      if (node.type === 'directory') continue;

      const nameMatch = node.name.toLowerCase().includes(query);
      let contentMatch = false;

      if (typeof node.content === 'string') {
        contentMatch = node.content.toLowerCase().includes(query);
      } else if (isManifest(node.content)) {
        contentMatch = JSON.stringify(node.content).toLowerCase().includes(query);
      } else if (isDecision(node.content)) {
        contentMatch = JSON.stringify(node.content).toLowerCase().includes(query);
      } else if (isService(node.content)) {
        contentMatch = JSON.stringify(node.content).toLowerCase().includes(query);
      }

      if (nameMatch || contentMatch) {
        results.push(`  ${nameMatch ? '[name] ' : '[content]'} ${path}`);
      }
    }

    if (results.length === 0) return { output: `search: no results for "${query}"` };
    return { output: [`Results for "${query}":`, ...results].join('\n') };
  },
};
