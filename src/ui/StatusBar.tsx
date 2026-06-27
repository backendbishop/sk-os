'use client';

import { useEffect, useState } from 'react';
import { useStore } from '../store';

function getEATTime(): string {
  return new Date().toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Africa/Nairobi',
  }).toUpperCase() + ' EAT';
}

export default function StatusBar() {
  const cwd = useStore(s => s.cwd);
  const processCount = useStore(s =>
    s.processes.filter(p => p.status === 'running').length
  );
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(getEATTime());
    const id = setInterval(() => setTime(getEATTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-7 bg-zinc-900 border-t border-zinc-800 flex items-center px-3 text-xs font-mono text-zinc-500 shrink-0">
      {/* Left — proc count */}
      <span className="w-24">{processCount} proc</span>

      {/* Center — location */}
      <span className="flex-1 text-center text-zinc-600">Mombasa, KE</span>

      {/* Right — time */}
      <span className="w-44 text-right text-zinc-400">{time}</span>
    </div>
  );
}
