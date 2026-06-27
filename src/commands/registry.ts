import { Command } from './types';

// Central command registry. Add a command by calling register().
// The terminal parser looks up commands by name from this map.

class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  all(): Command[] {
    return Array.from(this.commands.values());
  }
}

export const registry = new CommandRegistry();
