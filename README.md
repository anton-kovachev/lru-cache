# LRU Cache

A TypeScript implementation of a **Least Recently Used (LRU) Cache** data structure with comprehensive test coverage using Node.js built-in test runner.

## Overview

This project provides an efficient LRU cache implementation using a doubly-linked list and a hash map for O(1) time complexity on both `get` and `add` operations.

### Features

- **O(1) Time Complexity**: Both `get()` and `add()` operations run in constant time
- **Doubly-Linked List**: Maintains insertion/access order for LRU eviction
- **Hash Map Storage**: Fast key lookups and node references
- **TypeScript**: Full type safety with strict compilation options
- **Comprehensive Tests**: Edge cases, stress tests, and regression test suites

## Architecture

### Core Components

#### `ListNode`
Represents a single cache entry in the doubly-linked list:
- `key`: String identifier for the cached value
- `value`: Numeric value stored in the cache
- `previous`: Reference to the previous node (older/less recent)
- `next`: Reference to the next node (newer/more recent)

#### `LRUCache`
Main cache class with configurable capacity:
- `capacity`: Maximum number of entries the cache can hold
- `headNode`: Most recently used entry (newest)
- `tailNode`: Least recently used entry (oldest)
- `valueMap`: Hash map for O(1) key lookups

### Methods

#### `getValue(key: string): number`
Retrieves a value from the cache.
- Returns the value if found
- Returns `-1` if the key doesn't exist
- **Promotes the accessed node to head** (most recent)

#### `addValue(key: string, value: number): void`
Inserts or updates a cache entry.
- If key exists: updates its value and promotes it to head
- If key doesn't exist: creates new entry and adds it to head
- If cache exceeds capacity: evicts the tail (least recently used)

## Usage

### Installation

```bash
npm install
```

### Running Tests

Run the comprehensive test suite:

```bash
node --test lru-cache.tests.ts
```

Or with verbose output:

```bash
node --test --reporter=tap lru-cache.tests.ts
```

### Example

```typescript
import { LRUCache } from "./lru-cache.ts";

const cache = new LRUCache(2);

cache.addValue("a", 1);
cache.addValue("b", 2);
console.log(cache.getValue("a")); // 1

cache.addValue("c", 3); // Evicts "b" (least recently used)
console.log(cache.getValue("b")); // -1 (not found)
```

## Test Coverage

The test suite (`lru-cache.tests.ts`) includes:

### Normal Cases
- Basic get/add operations
- Capacity enforcement
- Entry promotion on access
- Eviction of least recently used entries

### Edge Cases
- Capacity zero
- Single-entry cache
- Duplicate key updates
- Miss sentinel value handling (-1)
- Special keys (`__proto__`, `constructor`, empty string, etc.)
- Unusual numeric values (Infinity, NaN, MAX_SAFE_INTEGER)

### Stress Tests
- 5000+ mixed random operations
- Large capacity (1000+) with thousands of entries
- Fuzzy testing with LRU model verification

### Regression Tests
- Doubly-linked list integrity
- Forward and backward traversal validation
- Hash map consistency checks

## Project Structure

```
lru-cache/
├── lru-cache.ts           # Main LRU cache implementation
├── lru-cache.tests.ts     # Comprehensive test suite
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project metadata and dependencies
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## Configuration

### TypeScript Settings (`tsconfig.json`)

- **target**: `esnext` - Use latest JavaScript features
- **module**: `nodenext` - ESM for Node.js
- **strict**: `true` - Strict type checking enabled
- **verbatimModuleSyntax**: `true` - Preserve module syntax
- **allowImportingTsExtensions**: `true` - Allow `.ts` imports

### Node.js

Requires Node.js v24.0.0 or higher for native TypeScript loader support.

## Implementation Notes

### Why LRU Cache?

LRU caches are essential for:
- **Memory management**: Bounded storage with automatic eviction
- **Performance optimization**: Fast repeated access patterns
- **Web applications**: Browser caches, CDN caches, database query caches
- **System design**: CPU caches, page replacement in OS

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| `getValue()` | O(1) | Hash map lookup + node promotion |
| `addValue()` | O(1) | Hash map insert + link updates |
| `eviction` | O(1) | Direct tail removal |

### Space Complexity

- O(capacity) - Stores at most `capacity` nodes

## Known Issues

- Test case: "updates a key whose stored value is the miss sentinel" reveals a bug where updating an entry with value `-1` corrupts the linked list structure

## Development

### Type Checking

```bash
tsc --noEmit
```

### Building

```bash
tsc
```

## License

MIT

## Author

Anton Kovachev
