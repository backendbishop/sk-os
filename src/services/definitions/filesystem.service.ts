import { Service } from '../../kernel/types';

export const filesystemService: Service = {
  id: 'filesystem.service',
  name: 'Filesystem Service',
  status: 'active',
  description: 'Manages the virtual filesystem. Resolves paths, reads nodes, traverses the tree.',
  architecture: 'In-memory tree of FSNode objects. Path resolution walks the tree recursively. O(depth) lookup.',
  tradeoffs: [
    'In-memory — fast reads, no persistence (intentional for a portfolio runtime).',
    'Immutable tree — no write operations exposed; content is static by design.',
  ],
};
