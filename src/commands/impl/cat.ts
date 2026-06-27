import { Command } from '../types';
import { isManifest, isDecision, isService } from '../../filesystem/nodes';

export const cat: Command = {
  name: 'cat',
  description: 'Read file contents',
  usage: 'cat <file>',
  execute(args, ctx) {
    if (!args[0]) return { output: 'cat: missing operand', error: true };
    const path = ctx.vfs.resolvePath(ctx.cwd, args[0]);
    const content = ctx.vfs.cat(path);
    if (content === undefined) return { output: `cat: ${args[0]}: no such file`, error: true };

    if (typeof content === 'string') return { output: content };

    if (isManifest(content)) {
      return {
        output: [
          `=== ${content.name} ===`,
          '',
          'PROBLEM',
          `  ${content.problem}`,
          '',
          'ARCHITECTURE',
          `  ${content.architecture}`,
          '',
          'TRADEOFFS',
          ...content.tradeoffs.map(t => `  · ${t}`),
          '',
          'FAILURE MODES',
          ...content.failureModes.map(f => `  · ${f}`),
          '',
          'LESSONS LEARNED',
          ...content.lessonsLearned.map(l => `  · ${l}`),
          '',
          `Tip: run 'open ${content.id}' to launch the full application.`,
        ].join('\n'),
      };
    }

    if (isDecision(content)) {
      return {
        output: [
          `=== ${content.title} ===`,
          '',
          'CONTEXT',
          `  ${content.context}`,
          '',
          'DECISION',
          `  ${content.decision}`,
          '',
          'ALTERNATIVES CONSIDERED',
          ...content.alternatives.map(a => `  · ${a}`),
          '',
          'TRADEOFFS',
          ...content.tradeoffs.map(t => `  · ${t}`),
          '',
          'OUTCOME',
          `  ${content.outcome}`,
        ].join('\n'),
      };
    }

    if (isService(content)) {
      return {
        output: [
          `=== ${content.name} ===`,
          `status: ${content.status}`,
          '',
          'PURPOSE',
          `  ${content.description}`,
          '',
          'ARCHITECTURE',
          `  ${content.architecture}`,
          '',
          'TRADEOFFS',
          ...content.tradeoffs.map(t => `  · ${t}`),
        ].join('\n'),
      };
    }

    return { output: JSON.stringify(content, null, 2) };
  },
};
