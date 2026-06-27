import { FSNode, ApplicationManifest, Decision, Service } from '../kernel/types';

// ── Helpers ─────────────────────────────────────────────────────────────────

export function dir(name: string, children: Record<string, FSNode>): FSNode {
  return {
    name,
    type: 'directory',
    children: new Map(Object.entries(children)),
  };
}

export function file(name: string, content: FSNode['content']): FSNode {
  return { name, type: 'file', content };
}

// ── Type Guards ──────────────────────────────────────────────────────────────

export function isManifest(v: unknown): v is ApplicationManifest {
  return typeof v === 'object' && v !== null && 'problem' in v;
}

export function isDecision(v: unknown): v is Decision {
  return typeof v === 'object' && v !== null && 'alternatives' in v;
}

export function isService(v: unknown): v is Service {
  return typeof v === 'object' && v !== null && 'architecture' in v && 'tradeoffs' in v && !('problem' in v);
}
