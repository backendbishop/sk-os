import { FSNode } from '../kernel/types';
import { dir, file } from './nodes';

// ── Works (Applications) ────────────────────────────────────────────────────

const works: Record<string, FSNode> = {
  alertke: file('alertke', {
    id: 'alertke',
    name: 'AlertKE',
    problem:
      'Kenyan businesses had no reliable, affordable alerting layer for backend events. Email was too slow; SMS gateways were expensive and unreliable.',
    architecture:
      'Event-driven pipeline: producers emit domain events → message broker (Redis Streams) → consumer workers → multi-channel fanout (SMS, email, push). Stateless workers scale horizontally. Delivery state tracked in Postgres.',
    tradeoffs: [
      'Redis Streams over Kafka — lower ops overhead at this scale, acceptable durability.',
      'At-least-once delivery — idempotency keys on consumers prevent duplicate side effects.',
      'Denormalized delivery log — fast reads, higher write amplification.',
    ],
    failureModes: [
      'Broker unavailability: workers retry with exponential backoff, dead-letter queue captures failures.',
      'SMS gateway timeout: fallback chain to secondary provider.',
      'Consumer lag: horizontal scaling triggered by stream length metric.',
    ],
    lessonsLearned: [
      'Idempotency must be designed in from day one — retrofitting it is expensive.',
      'Observability on the fanout layer is more valuable than on producers.',
      'Carrier reliability in East Africa requires multi-provider strategy by default.',
    ],
  }),

  ledgerflow: file('ledgerflow', {
    id: 'ledgerflow',
    name: 'LedgerFlow',
    problem:
      'SMEs needed double-entry bookkeeping without the complexity of enterprise accounting software. Existing tools were either too simple or required an accountant to operate.',
    architecture:
      'CQRS split: write side enforces double-entry invariants (every debit has a matching credit) via domain model. Read side maintains materialized views for reporting. Postgres as system of record. Audit log is append-only.',
    tradeoffs: [
      'CQRS over simple CRUD — necessary to separate financial consistency from reporting flexibility.',
      'Synchronous read model updates — simpler operationally, acceptable latency at this scale.',
      'No soft deletes — financial records are immutable; corrections are counter-entries.',
    ],
    failureModes: [
      'Read model drift: reconciliation job compares read model against write log nightly.',
      'Concurrent transactions: optimistic locking on account balances.',
      'Data corruption: checksums on journal entries, point-in-time recovery enabled.',
    ],
    lessonsLearned: [
      'Financial systems require immutability as a first-class constraint, not an afterthought.',
      'The audit log is the system — everything else is a projection of it.',
      'CQRS complexity is only justified when read and write models genuinely diverge.',
    ],
  }),

  sentinel: file('sentinel', {
    id: 'sentinel',
    name: 'Sentinel',
    problem:
      'Internal services had no unified health visibility. Failures were discovered by users, not operators.',
    architecture:
      'Pull-based health aggregator: Sentinel polls registered service endpoints on a configurable interval. Results stored in time-series structure. Threshold breaches emit events to AlertKE. Dashboard is a read projection.',
    tradeoffs: [
      'Pull over push — simpler service contract; services need no knowledge of Sentinel.',
      'In-process time-series over InfluxDB — sufficient for current scale, avoids extra infra.',
      'Polling interval as tradeoff knob — lower interval increases detection speed, higher load.',
    ],
    failureModes: [
      'Sentinel itself failing: watchdog process monitors and restarts it.',
      'False positives on transient errors: consecutive failure threshold before alerting.',
      'Network partition vs service failure: timeout tuning and retry budget.',
    ],
    lessonsLearned: [
      'Health checks must test actual dependencies, not just process liveness.',
      'Alerting fatigue is a systems problem — threshold design matters as much as detection.',
      'Observability tooling needs its own observability.',
    ],
  }),
};

// ── Decisions ───────────────────────────────────────────────────────────────

const decisions: Record<string, FSNode> = {
  'postgres-vs-mongodb': file('postgres-vs-mongodb', {
    id: 'postgres-vs-mongodb',
    title: 'Postgres vs MongoDB',
    context:
      'LedgerFlow required a persistent store for financial journal entries. Data had relational structure: accounts, entries, and balances with strict referential integrity requirements.',
    decision: 'Postgres',
    alternatives: [
      'MongoDB — flexible schema, easier horizontal sharding.',
      'SQLite — zero-ops, sufficient for single-node deployment.',
    ],
    tradeoffs: [
      'Postgres enforces constraints at the database level — critical for financial data.',
      'Schema rigidity is a feature here, not a limitation.',
      'Horizontal scaling is harder, but vertical scaling is sufficient at this stage.',
    ],
    outcome:
      'Correct decision. ACID guarantees and foreign key constraints caught several application-level bugs during development. No regrets at current scale.',
  }),

  'jwt-vs-sessions': file('jwt-vs-sessions', {
    id: 'jwt-vs-sessions',
    title: 'JWT vs Server Sessions',
    context:
      'AlertKE needed an auth strategy for its API. Services are stateless workers; no shared memory between instances.',
    decision: 'JWT with short expiry + refresh token rotation',
    alternatives: [
      'Server sessions with Redis — centralized, revocable, but adds stateful dependency.',
      'Opaque tokens — simple, but requires token introspection on every request.',
    ],
    tradeoffs: [
      'JWTs cannot be revoked before expiry — mitigated by short access token TTL (15min).',
      'Refresh token rotation invalidates stolen tokens on next use.',
      'No Redis dependency — simpler infra, stateless verification.',
    ],
    outcome:
      'Works well for stateless services. The inability to instantly revoke tokens is an accepted tradeoff given short TTLs and rotation strategy.',
  }),

  'event-driven-architecture': file('event-driven-architecture', {
    id: 'event-driven-architecture',
    title: 'Event-Driven Architecture',
    context:
      'AlertKE needed to fanout notifications across multiple channels without coupling producers to consumers. Synchronous fanout would create cascading failure risk.',
    decision: 'Async event-driven pipeline via Redis Streams',
    alternatives: [
      'Synchronous HTTP fanout — simple but brittle; one slow consumer blocks all.',
      'Kafka — more durable, better tooling, but significant operational overhead.',
      'RabbitMQ — good fit, but team had existing Redis operational knowledge.',
    ],
    tradeoffs: [
      'Async introduces eventual consistency — acceptable for notifications, not for financial ops.',
      'Redis Streams durability is lower than Kafka — mitigated by persistence config and DLQ.',
      'Debugging async flows requires better observability tooling.',
    ],
    outcome:
      'Correct for this domain. Notification delivery is inherently async. The decoupling allowed independent scaling of SMS, email, and push consumers.',
  }),
};

// ── Services ─────────────────────────────────────────────────────────────────

const services: Record<string, FSNode> = {
  'filesystem.service': file('filesystem.service', {
    id: 'filesystem.service',
    name: 'Filesystem Service',
    status: 'active',
    description: 'Manages the virtual filesystem. Resolves paths, reads nodes, traverses the tree.',
    architecture: 'In-memory tree of FSNode objects. Path resolution walks the tree recursively. O(depth) lookup.',
    tradeoffs: [
      'In-memory — fast reads, no persistence (intentional for a portfolio runtime).',
      'Immutable tree — no write operations exposed; content is static by design.',
    ],
  }),
  'search.service': file('search.service', {
    id: 'search.service',
    name: 'Search Service',
    status: 'active',
    description: 'Full-text search across the virtual filesystem. Indexes all file content on boot.',
    architecture: 'DFS traversal of filesystem tree. Matches query against file names and serialized content. Returns ranked results by match type (name > content).',
    tradeoffs: [
      'Linear scan — acceptable for portfolio-scale data.',
      'No inverted index — simpler implementation, sufficient performance.',
    ],
  }),
  'logs.service': file('logs.service', {
    id: 'logs.service',
    name: 'Logs Service',
    status: 'active',
    description: 'Appends structured log entries to system log. Subscribed to all kernel events.',
    architecture: 'Event bus subscriber. On any system event, formats and appends a LogEntry to store. Log is append-only.',
    tradeoffs: [
      'In-memory log — lost on reload (intentional; this is a session log).',
      'Append-only — no mutation, consistent with audit log principles.',
    ],
  }),
};

// ── Root Filesystem ──────────────────────────────────────────────────────────

export const rootFS: FSNode = dir('/', {
  about: file('about', [
    'SK OS — Systems Portfolio',
    '',
    'Backend engineer focused on distributed systems, reliability, and architecture.',
    'This environment exposes how I think about tradeoffs, failure modes, and system design.',
    '',
    'Stack:  Node.js · TypeScript · Postgres · Redis · Docker',
    'Focus:  Event-driven systems · CQRS · Observability · API design',
    '',
    'Contact: sk@example.com',
    'GitHub:  github.com/sk',
  ].join('\n')),

  works: dir('works', works),
  decisions: dir('decisions', decisions),
  services: dir('services', services),

  logs: file('logs', 'Live session log. Use the `logs` command to view.'),

  system: dir('system', {
    kernel: file('kernel', [
      'SK OS Kernel',
      '',
      'Responsibilities:',
      '  - Process lifecycle management',
      '  - Service registry',
      '  - Event dispatch via EventBus',
      '  - Window management coordination',
      '',
      'All inter-module communication goes through the event bus.',
      'No direct coupling between application modules.',
    ].join('\n')),

    processes: file('processes', 'Use the `processes` command to view the live process table.'),
  }),
});
