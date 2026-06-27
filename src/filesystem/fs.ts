import { FSNode } from '../kernel/types';
import { rootFS } from './tree';

// Virtual Filesystem — thin layer over the static tree.
// Supports path resolution, directory listing, and file reading.

class VirtualFilesystem {
  private root: FSNode = rootFS;

  // Resolve an absolute path to an FSNode. Returns undefined if not found.
  resolve(path: string): FSNode | undefined {
    const parts = this.normalizePath(path);
    if (parts.length === 0) return this.root;

    let node: FSNode = this.root;
    for (const part of parts) {
      if (node.type !== 'directory' || !node.children) return undefined;
      const child = node.children.get(part);
      if (!child) return undefined;
      node = child;
    }
    return node;
  }

  // List children of a directory node at path.
  ls(path: string): FSNode[] | undefined {
    const node = this.resolve(path);
    if (!node || node.type !== 'directory') return undefined;
    return Array.from(node.children?.values() ?? []);
  }

  // Read content of a file node at path.
  cat(path: string): FSNode['content'] | undefined {
    const node = this.resolve(path);
    if (!node || node.type !== 'file') return undefined;
    return node.content;
  }

  // Check if a path exists.
  exists(path: string): boolean {
    return this.resolve(path) !== undefined;
  }

  // Resolve a relative path against a cwd.
  resolvePath(cwd: string, input: string): string {
    if (input.startsWith('/')) return this.clean(input);
    if (input === '..') return this.parent(cwd);
    if (input === '.') return cwd;
    return this.clean(`${cwd === '/' ? '' : cwd}/${input}`);
  }

  // DFS traversal — yields [path, node] for every node in the tree.
  *walk(path = '/', node: FSNode = this.root): Generator<[string, FSNode]> {
    yield [path, node];
    if (node.type === 'directory' && node.children) {
      for (const [name, child] of node.children) {
        const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
        yield* this.walk(childPath, child);
      }
    }
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private normalizePath(path: string): string[] {
    return path.split('/').filter(Boolean);
  }

  private clean(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }

  private parent(path: string): string {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }
}

// Singleton
export const vfs = new VirtualFilesystem();
