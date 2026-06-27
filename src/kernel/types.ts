// ─── Process ───────────────────────────────────────────────────────────────

export type PID = number;
export type ProcessType = 'system' | 'application' | 'service';
export type ProcessStatus = 'running' | 'suspended' | 'killed';

export interface Process {
  pid: PID;
  name: string;
  type: ProcessType;
  status: ProcessStatus;
  startedAt: Date;
  windowId?: string;
}

// ─── Service ───────────────────────────────────────────────────────────────

export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
  architecture: string;
  tradeoffs: string[];
}

// ─── Filesystem ────────────────────────────────────────────────────────────

export type FSNodeType = 'file' | 'directory';

export interface FSNode {
  name: string;
  type: FSNodeType;
  content?: string | ApplicationManifest | Decision | Service;
  children?: Map<string, FSNode>;
}

// ─── Applications ──────────────────────────────────────────────────────────

export interface ApplicationManifest {
  id: string;
  name: string;
  problem: string;
  architecture: string;
  tradeoffs: string[];
  failureModes: string[];
  lessonsLearned: string[];
}

// ─── Decisions ─────────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string[];
  tradeoffs: string[];
  outcome: string;
}

// ─── Logs ──────────────────────────────────────────────────────────────────

export type LogLevel = 'info' | 'warn' | 'error' | 'system';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
}

// ─── Windows ───────────────────────────────────────────────────────────────

export interface Window {
  id: string;
  pid: PID;
  title: string;
  zIndex: number;
  focused: boolean;
}
