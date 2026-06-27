import { Command } from '../types';
import { useStore } from '../../store';

export const kill: Command = {
  name: 'kill',
  description: 'Kill a process by PID',
  usage: 'kill <pid>',
  execute(args, ctx) {
    const pid = parseInt(args[0]);
    if (isNaN(pid)) return { output: 'kill: invalid PID', error: true };

    const proc = ctx.kernel.getProcess(pid);
    if (!proc) return { output: `kill: ${pid}: no such process`, error: true };
    if (proc.type === 'system') return { output: `kill: ${pid}: operation not permitted — system process`, error: true };

    const success = ctx.kernel.killProcess(pid);
    if (!success) return { output: `kill: ${pid}: operation failed`, error: true };

    // Sync store — update process status and close window
    const store = useStore.getState();
    store.updateProcess(pid, { status: 'killed' });
    if (proc.windowId) store.removeWindow(proc.windowId);

    ctx.emit('PROCESS_KILLED', 'terminal', { pid, name: proc.name });
    return { output: `[${pid}] ${proc.name} terminated` };
  },
};
