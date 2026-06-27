import { EventType, SystemEvent } from './event-types';

type Handler = (event: SystemEvent) => void;

// Typed pub/sub. No direct imports between modules — all cross-domain
// communication goes through here.
class EventBus {
  private handlers: Map<EventType, Set<Handler>> = new Map();

  on(type: EventType, handler: Handler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Returns unsubscribe function
    return () => this.handlers.get(type)?.delete(handler);
  }

  emit(type: EventType, source: string, payload?: unknown): void {
    const event: SystemEvent = { type, payload, timestamp: new Date(), source };
    this.handlers.get(type)?.forEach(h => h(event));
  }

  // Remove all handlers for a type — used on shutdown
  off(type: EventType): void {
    this.handlers.delete(type);
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Singleton — one bus for the entire system
export const eventBus = new EventBus();
