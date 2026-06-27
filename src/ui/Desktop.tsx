'use client';

import { useEffect, useState } from 'react';
import { kernel } from '../kernel/kernel';
import { eventBus } from '../events/event-bus';
import { log } from '../logs/logger';
import { useStore } from '../store';
import { filesystemService } from '../services/definitions/filesystem.service';
import { searchService } from '../services/definitions/search.service';
import { logsService } from '../services/definitions/logs.service';
import Terminal from '../terminal/Terminal';
import WindowManager from './WindowManager';
import StatusBar from './StatusBar';

export default function Desktop() {
  const { setProcesses, addService } = useStore();

  useEffect(() => {
    kernel.boot();

    [filesystemService, searchService, logsService].forEach(s => {
      kernel.registerService(s);
      addService(s);
    });

    setProcesses(kernel.getProcesses());

    const unsubs = [
      eventBus.on('APP_STARTED',        e => log(`App started: ${(e.payload as any)?.id}`, 'kernel')),
      eventBus.on('APP_CLOSED',         e => log(`App closed: ${(e.payload as any)?.id}`, 'kernel')),
      eventBus.on('PROCESS_KILLED',     e => log(`Process killed: PID ${(e.payload as any)?.pid}`, 'kernel')),
      eventBus.on('SERVICE_REGISTERED', e => log(`Service registered: ${(e.payload as any)?.id}`, 'kernel')),
      eventBus.on('SHUTDOWN_INITIATED', () => log('Shutdown initiated', 'kernel', 'warn')),
    ];


    log('Desktop initialized', 'system');
    return () => unsubs.forEach(u => u());
  }, []);

  return (
    <div style={{ height: '100%' }} className="bg-black flex flex-col overflow-hidden">
      <div className="relative flex-1 min-h-0">
        <WindowManager />
        <Terminal />
      </div>
      <StatusBar />
    </div>
  );
}
