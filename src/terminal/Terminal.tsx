'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store';
import { execute } from './terminal';
import { kernel } from '../kernel/kernel';
import { vfs } from '../filesystem/fs';
import { eventBus } from '../events/event-bus';
import { log } from '../logs/logger';
import { registry } from '../commands/registry';

interface Line {
  id: number;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

let lineCounter = 0;

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}

function suggestCommand(input: string): string {
  const name = input.trim().split(/\s+/)[0].toLowerCase();
  const commands = registry.all().map(c => c.name);
  if (commands.includes(name))
    return `'${input.trim().split(/\s+/)[0]}': commands are case-sensitive. Try: ${name}`;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const cmd of commands) {
    const d = levenshtein(name, cmd);
    if (d < bestDist) { bestDist = d; best = cmd; }
  }
  if (best && bestDist <= 2)
    return `'${input.trim().split(/\s+/)[0]}': command not found. Did you mean: ${best}?`;
  return `'${input.trim().split(/\s+/)[0]}': command not found. Type 'help' for available commands.`;
}

const SHUTDOWN_SEQUENCE = [
  'Broadcast message from sk@backendbishop:',
  '',
  'The system is going down for shutdown NOW!',
  '',
  'Stopping services...',
  '  [ OK ] Stopped logs.service',
  '  [ OK ] Stopped search.service',
  '  [ OK ] Stopped filesystem.service',
  'Killing remaining processes...',
  '  [ OK ] Killed terminal',
  '  [ OK ] Killed kernel',
  'Unmounting filesystems...',
  '  [ OK ] Unmounted /',
  '',
  'System halted.',
];

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [shuttingDown, setShuttingDown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { cwd, setCwd, addWindow, addProcess } = useStore();

  const addLine = (text: string, type: Line['type'] = 'output') => {
    setLines(prev => [...prev, { id: ++lineCounter, type, text }]);
  };

  const runShutdown = useCallback(() => {
    setShuttingDown(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < SHUTDOWN_SEQUENCE.length) {
        addLine(SHUTDOWN_SEQUENCE[i], 'system');
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setLines([]);
          setTimeout(() => window.location.reload(), 800);
        }, 600);
      }
    }, 140);
  }, []);

  const openApp = useCallback((id: string) => {
    const paths = [`/works/${id}`, `/decisions/${id}`, `/services/${id}`, `/${id}`];
    for (const p of paths) {
      if (vfs.exists(p)) {
        const windowId = `win-${id}-${Date.now()}`;
        const pid = kernel.registerProcess(id, 'application', windowId);
        addProcess(kernel.getProcess(pid)!);
        addWindow({ id: windowId, pid, title: id, zIndex: 10 + pid, focused: true });
        log(`Launched ${id}`, 'kernel');
        return;
      }
    }
    addLine(`open: '${id}': no such application. Run 'ls /works' to see available apps.`, 'error');
  }, [addProcess, addWindow]);

  const submit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || shuttingDown) return;

    addLine(`${cwd} $ ${trimmed}`, 'input');
    setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setInput('');

    if (trimmed === 'shutdown') { runShutdown(); return; }

    eventBus.emit('TERMINAL_COMMAND', 'terminal', { input: trimmed });

    const result = execute(trimmed, {
      kernel, vfs,
      emit: eventBus.emit.bind(eventBus),
      cwd, setCwd,
      addLog: log,
      openApp,
    });

    if (result.clear) { setLines([]); return; }

    if (result.error && result.output.includes('command not found')) {
      addLine(suggestCommand(trimmed), 'error');
      return;
    }

    if (result.output) addLine(result.output, result.error ? 'error' : 'output');
  }, [input, cwd, setCwd, openApp, shuttingDown, runShutdown]);

  const handleTabCompletion = useCallback(() => {
    const trimmed = input;
    const parts = trimmed.split(/\s+/);

    if (parts.length <= 1) {
      const partial = parts[0] ?? '';
      const matches = registry.all()
        .map(c => c.name)
        .filter(name => name.startsWith(partial));

      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        addLine(`${cwd} $ ${trimmed}`, 'input');
        addLine(matches.join('  '), 'output');
      }
      return;
    }

    const lastArg = parts[parts.length - 1];
    const dirPart = lastArg.includes('/') ? lastArg.slice(0, lastArg.lastIndexOf('/') + 1) : '';
    const namePart = lastArg.includes('/') ? lastArg.slice(lastArg.lastIndexOf('/') + 1) : lastArg;

    const basePath = dirPart ? vfs.resolvePath(cwd, dirPart) : cwd;

    const nodes = vfs.ls(basePath);
    if (!nodes) return;

    const matches = nodes
      .map(n => n.type === 'directory' ? n.name + '/' : n.name)
      .filter(name => name.startsWith(namePart));

    if (matches.length === 1) {
      parts[parts.length - 1] = dirPart + matches[0];
      setInput(parts.join(' '));
    } else if (matches.length > 1) {
      addLine(`${cwd} $ ${trimmed}`, 'input');
      addLine(matches.join('  '), 'output');
    }
  }, [input, cwd]);

  const historyUp = useCallback(() => {
    const next = Math.min(historyIndex + 1, history.length - 1);
    setHistoryIndex(next);
    setInput(history[next] ?? '');
  }, [historyIndex, history]);

  const historyDown = useCallback(() => {
    const next = Math.max(historyIndex - 1, -1);
    setHistoryIndex(next);
    setInput(next === -1 ? '' : history[next]);
  }, [historyIndex, history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [lines]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') { e.preventDefault(); handleTabCompletion(); return; }
    if (e.key === 'Enter') { submit(); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); historyUp(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); historyDown(); return; }
  };

  const promptTop = `┌──(sk㉿backendbishop)-[${cwd}]`;
  const promptBottom = `└─$`;

  return (
    <div className="flex flex-col bg-black" style={{ height: "100dvh" }}>
      <div
        className="flex-1 overflow-y-auto text-zinc-300 px-3 text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="pt-5 mb-8">
          <span className="text-blue-400 font-bold">SK OS v1.0.0</span>
          <span className="text-zinc-600"> — type </span>
          <span className="text-blue-400">'help'</span>
          <span className="text-zinc-600"> to begin</span>
        </div>

        {lines.map(line => (
          <div
            key={line.id}
            className={
              line.type === 'input'  ? 'text-zinc-500 mb-1' :
              line.type === 'error'  ? 'text-red-400 mb-1' :
              line.type === 'system' ? 'text-zinc-400 mb-0.5' :
              'text-zinc-300 whitespace-pre-wrap mb-1'
            }
          >
            {line.text}
          </div>
        ))}

        {!shuttingDown && (
          <div className="mt-2 pb-4" ref={bottomRef}>
            <div className="text-blue-400">{promptTop}</div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 shrink-0">{promptBottom}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-zinc-200 caret-blue-400 min-w-0"
                spellCheck={false}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                data-form-type="other"
                aria-autocomplete="none"
                name={`sk-terminal-${Math.random()}`}
              />
            </div>
          </div>
        )}

        {shuttingDown && <div ref={bottomRef} />}
      </div>

      {!shuttingDown && (
        <div className="sm:hidden flex border-t border-zinc-700 bg-zinc-900 shrink-0">
          <button
            onClick={() => { historyUp(); inputRef.current?.focus(); }}
            className="flex-1 py-3 text-blue-400 text-base border-r border-zinc-700 active:bg-zinc-800"
          >
            ↑
          </button>
          <button
            onClick={() => { historyDown(); inputRef.current?.focus(); }}
            className="flex-1 py-3 text-blue-400 text-base border-r border-zinc-700 active:bg-zinc-800"
          >
            ↓
          </button>
          <button
            onClick={() => { handleTabCompletion(); inputRef.current?.focus(); }}
            className="flex-1 py-3 text-blue-400 text-base active:bg-zinc-800"
          >
            Tab
          </button>
        </div>
      )}
    </div>
  );
}
