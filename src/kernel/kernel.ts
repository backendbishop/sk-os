import { PID, Process, ProcessType, Service } from './types';
import { eventBus } from '../events/event-bus';

class Kernel {
  private processes: Map<PID, Process> = new Map();
  private services: Map<string, Service> = new Map();
  private pidCounter = 0;
  private bootTime: Date = new Date();

  // ── Boot ────────────────────────────────────────────────────────────────

  boot(): void {
    this.bootTime = new Date();
    // Register core system processes
    this.registerProcess('kernel', 'system');
    this.registerProcess('terminal', 'system');
    eventBus.emit('KERNEL_READY', 'kernel');
  }

  getBootTime(): Date {
    return this.bootTime;
  }

  // ── Processes ───────────────────────────────────────────────────────────

  registerProcess(name: string, type: ProcessType, windowId?: string): PID {
    const pid = ++this.pidCounter;
    const process: Process = {
      pid,
      name,
      type,
      status: 'running',
      startedAt: new Date(),
      windowId,
    };
    this.processes.set(pid, process);
    eventBus.emit('PROCESS_REGISTERED', 'kernel', { pid, name });
    return pid;
  }

  killProcess(pid: PID): boolean {
    const process = this.processes.get(pid);
    if (!process) return false;

    // System processes are protected
    if (process.type === 'system') return false;

    process.status = 'killed';
    this.processes.set(pid, process);
    eventBus.emit('PROCESS_KILLED', 'kernel', { pid, name: process.name });
    return true;
  }

  getProcess(pid: PID): Process | undefined {
    return this.processes.get(pid);
  }

  getProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  // ── Services ────────────────────────────────────────────────────────────

  registerService(service: Service): void {
    this.services.set(service.id, service);
    eventBus.emit('SERVICE_REGISTERED', 'kernel', { id: service.id });
  }

  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  getServices(): Service[] {
    return Array.from(this.services.values());
  }
}

// Singleton — one kernel instance
export const kernel = new Kernel();
