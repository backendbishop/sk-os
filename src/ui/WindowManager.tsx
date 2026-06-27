'use client';

import { useStore } from '../store';
import ApplicationWindow from '../applications/ApplicationWindow';
import { vfs } from '../filesystem/fs';
import { isManifest, isDecision, isService } from '../filesystem/nodes';

// Renders all open windows. Each window maps to a process + VFS node.
export default function WindowManager() {
  const windows = useStore(s => s.windows);

  return (
    <>
      {windows.map(win => {
        // Try to resolve content from VFS — works, decisions, services
        const paths = [
          `/works/${win.title}`,
          `/decisions/${win.title}`,
          `/services/${win.title}`,
          `/${win.title}`,
        ];

        let content: ReturnType<typeof vfs.cat> = undefined;
        for (const p of paths) {
          content = vfs.cat(p);
          if (content !== undefined) break;
        }

        if (content === undefined) return null;
        if (
          !isManifest(content) &&
          !isDecision(content) &&
          !isService(content) &&
          typeof content !== 'string'
        ) return null;

        return (
          <ApplicationWindow
            key={win.id}
            windowId={win.id}
            pid={win.pid}
            appId={win.title}
            content={content as ApplicationManifest | Decision | Service | string}
          />
        );
      })}
    </>
  );
}
