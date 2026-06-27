import { Command } from '../types';

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export const neofetch: Command = {
  name: 'neofetch',
  description: 'Display system information',
  usage: 'neofetch',
  execute(_args, ctx) {
    const processes = ctx.kernel.getProcesses();
    const running = processes.filter(p => p.status === 'running');
    const services = ctx.kernel.getServices();
    const activeServices = services.filter(s => s.status === 'active');
    const uptime = formatUptime(Date.now() - ctx.kernel.getBootTime().getTime());

    const logo = '[ SK-OS ]';

    const info = [
      'OS:        SK OS v1',
      'Shell:     sk-terminal',
      `Uptime:    ${uptime}`,
      `CWD:       ${ctx.cwd}`,
      `Processes: ${running.length}/${processes.length} running`,
      `Services:  ${activeServices.length}/${services.length} active`,
    ];

    return { output: [logo, '─'.repeat(logo.length), ...info].join('\n') };
  },
};
