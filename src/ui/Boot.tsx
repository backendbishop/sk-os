'use client';

import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const SEQUENCE = [
  'SK OS v1.0.0',
  '',
  'Initializing kernel...',
  'Mounting filesystem...',
  'Registering services...',
  'Starting event bus...',
  'Loading profile...',
  '',
  'BOOT COMPLETE',
];

export default function Boot({ onComplete }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < SEQUENCE.length) {
        setLines(prev => [...prev, SEQUENCE[i]]);
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!done) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter') onComplete(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [done, onComplete]);

  return (
    <div
      className="min-h-screen bg-black text-blue-400 font-mono flex items-center justify-center p-8"
      onClick={() => done && onComplete()}
    >
      <div>
        {lines.map((line, i) => (
          <div key={i} className={`leading-6 ${line === 'BOOT COMPLETE' ? 'text-white font-bold mt-2' : ''}`}>
            {line || <br />}
          </div>
        ))}
        {done && (
          <div className="mt-6 text-zinc-500 animate-pulse">
            Press Enter or tap to continue
          </div>
        )}
      </div>
    </div>
  );
}
