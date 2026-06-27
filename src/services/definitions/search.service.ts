import { Service } from '../../kernel/types';

export const searchService: Service = {
  id: 'search.service',
  name: 'Search Service',
  status: 'active',
  description: 'Full-text search across the virtual filesystem.',
  architecture: 'DFS traversal of filesystem tree. Matches query against file names and serialized content. Returns results ranked by match type.',
  tradeoffs: [
    'Linear scan — acceptable for portfolio-scale data.',
    'No inverted index — simpler implementation, sufficient performance.',
  ],
};
