import { create } from 'zustand';
import { LogEntry, Process, Service, Window } from '../kernel/types';

interface SKOSState {
  // ── System ──────────────────────────────────────────────────────────────
  booted: boolean;
  setBooted: (v: boolean) => void;

  // ── Terminal ────────────────────────────────────────────────────────────
  cwd: string;
  setCwd: (path: string) => void;

  // ── Processes ───────────────────────────────────────────────────────────
  processes: Process[];
  setProcesses: (p: Process[]) => void;
  addProcess: (p: Process) => void;
  updateProcess: (pid: number, patch: Partial<Process>) => void;

  // ── Services ────────────────────────────────────────────────────────────
  services: Service[];
  addService: (s: Service) => void;

  // ── Windows ─────────────────────────────────────────────────────────────
  windows: Window[];
  addWindow: (w: Window) => void;
  removeWindow: (id: string) => void;
  focusWindow: (id: string) => void;

  // ── Logs ────────────────────────────────────────────────────────────────
  logs: LogEntry[];
  addLog: (entry: LogEntry) => void;
}

export const useStore = create<SKOSState>((set) => ({
  // ── System ──────────────────────────────────────────────────────────────
  booted: false,
  setBooted: (v) => set({ booted: v }),

  // ── Terminal ────────────────────────────────────────────────────────────
  cwd: '/',
  setCwd: (path) => set({ cwd: path }),

  // ── Processes ───────────────────────────────────────────────────────────
  processes: [],
  setProcesses: (processes) => set({ processes }),
  addProcess: (p) => set((s) => ({ processes: [...s.processes, p] })),
  updateProcess: (pid, patch) =>
    set((s) => ({
      processes: s.processes.map((p) => (p.pid === pid ? { ...p, ...patch } : p)),
    })),

  // ── Services ────────────────────────────────────────────────────────────
  services: [],
  addService: (sv) => set((s) => ({ services: [...s.services, sv] })),

  // ── Windows ─────────────────────────────────────────────────────────────
  windows: [],
  addWindow: (w) => set((s) => ({ windows: [...s.windows, w] })),
  removeWindow: (id) =>
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
  focusWindow: (id) =>
    set((s) => {
      const maxZ = Math.max(0, ...s.windows.map((w) => w.zIndex));
      return {
        windows: s.windows.map((w) => ({
          ...w,
          focused: w.id === id,
          zIndex: w.id === id ? maxZ + 1 : w.zIndex,
        })),
      };
    }),

  // ── Logs ────────────────────────────────────────────────────────────────
  logs: [],
  addLog: (entry) => set((s) => ({ logs: [...s.logs, entry] })),
}));
