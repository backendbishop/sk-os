import { Command } from '../types';

function seededStat(pid: number, min: number, max: number, salt: number): number {
  const x = Math.sin(pid * 9301 + salt * 49297) * 233280;
  const frac = x - Math.floor(x);
  return Math.round((min + frac * (max - min)) * 10) / 10;
}

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h${m}m`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

export const processes: Command = {
  name: 'processes',
  description: 'List running processes',
  usage: 'processes',
  execute(_, ctx) {
    if (ctx.cwd !== '/') return {
      output: `processes: command not available outside /\n  hint: cd /`,
      error: true,
    };
    const procs = ctx.kernel.getProcesses().filter(p => p.status === 'running');
    if (procs.length === 0) return { output: 'No running processes.' };

    const now = Date.now();

    const blocks = procs.map(p => {
      const cpu = p.type === 'system' ? seededStat(p.pid, 0.1, 1.5, 1) : seededStat(p.pid, 1, 8, 1);
      const mem = p.type === 'system' ? seededStat(p.pid, 0.5, 2, 2) : seededStat(p.pid, 2, 12, 2);
      const uptime = formatUptime(now - new Date(p.startedAt).getTime());
      return (
        `[${p.pid}] ${p.name} (${p.type})\n` +
        `  cpu ${cpu.toFixed(1)}%  mem ${mem.toFixed(1)}%  up ${uptime}`
      );
    });

    const hints = [
      '',
      "hint: 'open <name>' launches an app",
      "      'kill <pid>' ends a process",
      "      system processes can't be killed",
    ];

    return { output: [...blocks, ...hints].join('\n') };
  },
};
