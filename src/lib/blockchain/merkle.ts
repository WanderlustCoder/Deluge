/**
 * Merkle Tree Construction
 * Plan 27: Blockchain Transparency Ledger
 *
 * Efficiently batch records into a single root hash for blockchain anchoring.
 * Provides proof generation and verification for individual records.
 */

import { sha256, combineHashes } from './hashing';

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  index?: number; // Leaf index
}

export interface MerkleProof {
  hash: string;
  siblings: Array<{
    hash: string;
    position: 'left' | 'right';
  }>;
  root: string;
  index: number;
}

/**
 * Build a Merkle tree from a list of hashes
 */
export function buildMerkleTree(hashes: string[]): MerkleNode | null {
  if (hashes.length === 0) {
    return null;
  }

  // Create leaf nodes
  let nodes: MerkleNode[] = hashes.map((hash, index) => ({
    hash,
    index,
  }));

  // If odd number of leaves, duplicate the last one
  if (nodes.length % 2 === 1 && nodes.length > 1) {
    nodes.push({ ...nodes[nodes.length - 1] });
  }

  // Build tree bottom-up
  while (nodes.length > 1) {
    const nextLevel: MerkleNode[] = [];

    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] ?? left; // Handle odd case

      nextLevel.push({
        hash: combineHashes(left.hash, right.hash),
        left,
        right,
      });
    }

    nodes = nextLevel;
  }

  return nodes[0];
}

/**
 * Get the root hash of a Merkle tree
 */
export function getMerkleRoot(hashes: string[]): string | null {
  const tree = buildMerkleTree(hashes);
  return tree?.hash ?? null;
}

/**
 * Generate a Merkle proof for a specific hash at index
 */
export function generateMerkleProof(
  hashes: string[],
  targetIndex: number
): MerkleProof | null {
  if (targetIndex < 0 || targetIndex >= hashes.length) {
    return null;
  }

  const targetHash = hashes[targetIndex];
  const siblings: MerkleProof['siblings'] = [];

  // Work with indices to build proof
  let currentIndex = targetIndex;
  let currentLevel = [...hashes];

  // Pad to even length if needed
  if (currentLevel.length % 2 === 1 && currentLevel.length > 1) {
    currentLevel.push(currentLevel[currentLevel.length - 1]);
  }

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] ?? left;

      nextLevel.push(combineHashes(left, right));

      // If current index is in this pair, record the sibling
      if (i === currentIndex || i + 1 === currentIndex) {
        const siblingIndex = currentIndex % 2 === 0 ? i + 1 : i;
        const siblingHash = currentLevel[siblingIndex] ?? currentLevel[i];
        const position = currentIndex % 2 === 0 ? 'right' : 'left';

        siblings.push({ hash: siblingHash, position });
      }
    }

    currentIndex = Math.floor(currentIndex / 2);
    currentLevel = nextLevel;

    // Pad next level
    if (currentLevel.length % 2 === 1 && currentLevel.length > 1) {
      currentLevel.push(currentLevel[currentLevel.length - 1]);
    }
  }

  return {
    hash: targetHash,
    siblings,
    root: currentLevel[0],
    index: targetIndex,
  };
}

/**
 * Verify a Merkle proof
 */
export function verifyMerkleProof(proof: MerkleProof): boolean {
  let currentHash = proof.hash;

  for (const sibling of proof.siblings) {
    if (sibling.position === 'left') {
      currentHash = combineHashes(sibling.hash, currentHash);
    } else {
      currentHash = combineHashes(currentHash, sibling.hash);
    }
  }

  return currentHash === proof.root;
}

/**
 * Calculate the size of a Merkle tree given number of leaves
 */
export function calculateTreeSize(leafCount: number): number {
  if (leafCount === 0) return 0;

  // For n leaves, tree has 2n-1 nodes (for perfect binary tree)
  // We pad to next power of 2 for simplicity
  const paddedCount = Math.pow(2, Math.ceil(Math.log2(leafCount)));
  return 2 * paddedCount - 1;
}

/**
 * Get all leaf hashes from a tree
 */
export function getLeafHashes(tree: MerkleNode | null): string[] {
  if (!tree) return [];

  const leaves: string[] = [];

  function traverse(node: MerkleNode) {
    if (!node.left && !node.right) {
      leaves.push(node.hash);
    } else {
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    }
  }

  traverse(tree);
  return leaves;
}
