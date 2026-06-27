import { registry } from '../commands';
import { CommandContext, CommandResult } from '../commands/types';
import { CLEAR_SENTINEL } from '../commands/impl/clear';

// Parses raw input, resolves command, executes with context.
// Returns structured result for the UI to render.

export function execute(
  input: string,
  ctx: CommandContext
): CommandResult & { clear?: boolean } {
  const trimmed = input.trim();
  if (!trimmed) return { output: '' };

  const [name, ...args] = trimmed.split(/\s+/);
  const command = registry.get(name);

  if (!command) {
    return {
      output: `${name}: command not found. Type 'help' for available commands.`,
      error: true,
    };
  }

  ctx.addLog(`$ ${trimmed}`, 'terminal');
  const result = command.execute(args, ctx);

  if (result.output === CLEAR_SENTINEL) {
    return { output: '', clear: true };
  }

  return result;
}
