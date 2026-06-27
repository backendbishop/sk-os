'use client';

import { useStore } from '../store';
import { kernel } from '../kernel/kernel';

// Toggled open via `processes` command or keyboard shortcut.
// Displays live process table with kill action.

export default function ProcessManager() {
  const processes = useStore(s => s.processes);
  const { removeWindow, setProcesses } = useStore();

  const running = processes.filter(p => p.status === 'running');

  const handleKill = (pid: number) => {
    const proc = processes.find(p => p.pid === pid);
    if (!proc || proc.type === 'system') return;

    kernel.killProcess(pid);

    // Sync store
    setProcesses(
      processes.map(p => p.pid === pid ? { ...p, status: 'killed' } : p)
    );

    // Close window if one exists
    if (proc.windowId) removeWindow(proc.windowId);
  };

  return (
    <div className="absolute top-8 right-4 w-80 bg-zinc-950 border border-zinc-800 font-mono text-xs z-50">
      {/* Header */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 text-zinc-400">
        processes
      </div>

      {/* Table */}
      <div className="p-2">
        {/* Column headers */}
        <div className="flex px-2 py-1 text-zinc-600">
          <span className="w-10">PID</span>
          <span className="w-20">TYPE</span>
          <span className="flex-1">NAME</span>
          <span className="w-8" />
        </div>

        {running.length === 0 && (
          <div className="px-2 py-2 text-zinc-600">no processes</div>
        )}

        {running.map(p => (
          <div
            key={p.pid}
            className="flex items-center px-2 py-1 hover:bg-zinc-900 group"
          >
            <span className="w-10 text-zinc-500">{p.pid}</span>
            <span className="w-20 text-zinc-500">{p.type}</span>
            <span className="flex-1 text-zinc-200">{p.name}</span>
            {p.type !== 'system' ? (
              <button
                onClick={() => handleKill(p.pid)}
                className="w-8 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            ) : (
              <span className="w-8" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-zinc-800 text-zinc-600">
        {running.length} running
      </div>
    </div>
  );
}
