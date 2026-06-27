import { kernel } from '../kernel/kernel';
import { vfs } from '../filesystem/fs';
import { eventBus } from '../events/event-bus';

// Every command receives this context — no direct module imports needed.
export interface CommandContext {
  kernel: typeof kernel;
  vfs: typeof vfs;
  emit: typeof eventBus.emit;
  cwd: string;
  setCwd: (path: string) => void;
  addLog: (msg: string, source?: string) => void;
  openApp: (id: string) => void;
}

export interface CommandResult {
  output: string;
  error?: boolean;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  execute(args: string[], ctx: CommandContext): CommandResult;
}
