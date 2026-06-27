'use client';

import { useState, useCallback } from 'react';
import Boot from '../src/ui/Boot';
import Desktop from '../src/ui/Desktop';

export default function Page() {
  const [booted, setBooted] = useState(false);
  const onComplete = useCallback(() => setBooted(true), []);

  return booted ? <Desktop /> : <Boot onComplete={onComplete} />;
}
