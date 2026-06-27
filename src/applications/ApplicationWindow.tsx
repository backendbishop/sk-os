'use client';

import { useStore } from '../store';
import { isManifest, isDecision, isService } from '../filesystem/nodes';
import { ApplicationManifest, Decision, Service } from '../kernel/types';

interface Props {
  windowId: string;
  pid: number;
  appId: string;
  content: ApplicationManifest | Decision | Service | string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-zinc-600 text-xs uppercase tracking-widest mb-2">{title}</div>
      <div className="text-zinc-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ManifestView({ m }: { m: ApplicationManifest }) {
  return (
    <>
      <Section title="Problem">{m.problem}</Section>
      <Section title="Architecture">{m.architecture}</Section>
      <Section title="Tradeoffs">
        <ul className="space-y-1">{m.tradeoffs.map((t, i) => <li key={i}>· {t}</li>)}</ul>
      </Section>
      <Section title="Failure Modes">
        <ul className="space-y-1">{m.failureModes.map((f, i) => <li key={i}>· {f}</li>)}</ul>
      </Section>
      <Section title="Lessons Learned">
        <ul className="space-y-1">{m.lessonsLearned.map((l, i) => <li key={i}>· {l}</li>)}</ul>
      </Section>
    </>
  );
}

function DecisionView({ d }: { d: Decision }) {
  return (
    <>
      <Section title="Context">{d.context}</Section>
      <Section title="Decision"><span className="text-green-400">{d.decision}</span></Section>
      <Section title="Alternatives Considered">
        <ul className="space-y-1">{d.alternatives.map((a, i) => <li key={i}>· {a}</li>)}</ul>
      </Section>
      <Section title="Tradeoffs">
        <ul className="space-y-1">{d.tradeoffs.map((t, i) => <li key={i}>· {t}</li>)}</ul>
      </Section>
      <Section title="Outcome">{d.outcome}</Section>
    </>
  );
}

function ServiceView({ s }: { s: Service }) {
  return (
    <>
      <Section title="Purpose">{s.description}</Section>
      <Section title="Architecture">{s.architecture}</Section>
      <Section title="Tradeoffs">
        <ul className="space-y-1">{s.tradeoffs.map((t, i) => <li key={i}>· {t}</li>)}</ul>
      </Section>
    </>
  );
}

export default function ApplicationWindow({ windowId, pid, appId, content }: Props) {
  const { removeWindow } = useStore();

  const title = isManifest(content) ? content.name
    : isDecision(content) ? content.title
    : isService(content) ? content.name
    : appId;

  return (
    // Full-screen overlay — no floating windows on mobile
    <div className="absolute inset-0 bg-black z-50 flex flex-col font-mono">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <span className="text-xs text-zinc-500">
          <span className="text-zinc-700">PID {pid} · </span>
          <span className="text-zinc-300">{title}</span>
        </span>
        <button
          onClick={() => removeWindow(windowId)}
          className="text-zinc-600 hover:text-zinc-200 text-xs px-2 py-1 border border-zinc-800 hover:border-zinc-600"
        >
          ✕ close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isManifest(content) && <ManifestView m={content} />}
        {isDecision(content) && <DecisionView d={content} />}
        {isService(content) && <ServiceView s={content} />}
        {typeof content === 'string' && (
          <pre className="text-zinc-300 whitespace-pre-wrap text-sm">{content}</pre>
        )}
      </div>
    </div>
  );
}
