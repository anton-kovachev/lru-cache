import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { LRUCache } from "./lru-cache.ts";

type Cache = InstanceType<typeof LRUCache>;
type CacheNode = NonNullable<Cache["headNode"]>;

function assertOrder(cache: Cache, expected: string[]): void {
  assert.equal(cache.valueMap.size, expected.length);
  assert.equal(cache.tailNode?.key ?? null, expected[0] ?? null);
  assert.equal(cache.headNode?.key ?? null, expected.at(-1) ?? null);

  const forward: string[] = [];
  let previous: CacheNode | null = null;
  let node = cache.tailNode;
  while (node) {
    assert.ok(
      forward.length < expected.length,
      "list has a cycle or extra nodes",
    );
    assert.equal(node.previous, previous);
    assert.equal(cache.valueMap.get(node.key), node);
    forward.push(node.key);
    previous = node;
    node = node.next;
  }
  assert.deepEqual(forward, expected);
  assert.equal(previous, cache.headNode);

  const backward: string[] = [];
  let next: CacheNode | null = null;
  node = cache.headNode;
  while (node) {
    assert.ok(
      backward.length < expected.length,
      "reverse list has a cycle or extra nodes",
    );
    assert.equal(node.next, next);
    backward.push(node.key);
    next = node;
    node = node.previous;
  }
  assert.deepEqual(backward, [...expected].reverse());
  assert.equal(next, cache.tailNode);
}

describe("LRUCache", () => {
  it("starts empty and returns -1 for a missing key", () => {
    const cache = new LRUCache(3);
    assert.equal(cache.capacity, 3);
    assert.equal(cache.getValue("missing"), -1);
    assertOrder(cache, []);
  });

  it("stores values and evicts the least recently used entry", () => {
    const cache = new LRUCache(3);
    cache.addValue("a", 1);
    cache.addValue("b", 2);
    cache.addValue("c", 3);
    assertOrder(cache, ["a", "b", "c"]);

    cache.addValue("d", 4);
    assert.equal(cache.getValue("a"), -1);
    assertOrder(cache, ["b", "c", "d"]);
    assert.equal(cache.getValue("d"), 4);
  });

  it("promotes tail and middle hits, but misses do not change recency", () => {
    const cache = new LRUCache(4);
    for (const [key, value] of [
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["d", 4],
    ] as const) {
      cache.addValue(key, value);
    }
    assert.equal(cache.getValue("a"), 1);
    assertOrder(cache, ["b", "c", "d", "a"]);
    assert.equal(cache.getValue("d"), 4);
    assertOrder(cache, ["b", "c", "a", "d"]);
    assert.equal(cache.getValue("d"), 4);
    assert.equal(cache.getValue("missing"), -1);
    assertOrder(cache, ["b", "c", "a", "d"]);

    cache.addValue("e", 5);
    assert.equal(cache.getValue("b"), -1);
    assertOrder(cache, ["c", "a", "d", "e"]);
  });

  it("updates existing entries without growing and promotes them", () => {
    const cache = new LRUCache(3);
    cache.addValue("a", 1);
    cache.addValue("b", 2);
    cache.addValue("c", 3);
    cache.addValue("a", 10);
    assertOrder(cache, ["b", "c", "a"]);
    cache.addValue("a", 11);
    assert.equal(cache.getValue("a"), 11);
    assertOrder(cache, ["b", "c", "a"]);
    cache.addValue("d", 4);
    assert.equal(cache.getValue("b"), -1);
    assertOrder(cache, ["c", "a", "d"]);
  });

  it("handles capacity zero and repeated eviction at capacity one", () => {
    const empty = new LRUCache(0);
    empty.addValue("a", 1);
    empty.addValue("b", 2);
    assert.equal(empty.getValue("a"), -1);
    assertOrder(empty, []);

    const single = new LRUCache(1);
    single.addValue("a", 1);
    single.addValue("a", 2);
    assert.equal(single.getValue("a"), 2);
    assertOrder(single, ["a"]);
    single.addValue("b", 3);
    assert.equal(single.getValue("a"), -1);
    assertOrder(single, ["b"]);
    single.addValue("a", 4);
    assert.equal(single.getValue("b"), -1);
    assert.equal(single.getValue("a"), 4);
    assertOrder(single, ["a"]);
  });

  it("supports unusual string keys and numeric values", () => {
    const cache = new LRUCache(6);
    const entries: [string, number][] = [
      ["", 0],
      ["__proto__", -42],
      ["constructor", Number.MAX_SAFE_INTEGER],
      ["unicode-雪", Number.MIN_SAFE_INTEGER],
      ["long".repeat(1000), Infinity],
      ["nan", NaN],
    ];
    for (const [key, value] of entries) cache.addValue(key, value);
    for (const [key, value] of entries)
      assert.equal(cache.getValue(key), value);
    assertOrder(
      cache,
      entries.map(([key]) => key),
    );
  });

  it("updates a key whose stored value is the miss sentinel without corrupting the list", () => {
    const cache = new LRUCache(3);
    cache.addValue("a", -1);
    cache.addValue("b", 2);
    cache.addValue("a", 10);
    assert.equal(cache.getValue("a"), 10);
    assertOrder(cache, ["b", "a"]);
    cache.addValue("c", 3);
    cache.addValue("d", 4);
    assert.equal(cache.getValue("b"), -1);
    assertOrder(cache, ["a", "c", "d"]);
  });

  it("matches an independent LRU model over many mixed operations", () => {
    const capacity = 37;
    const cache = new LRUCache(capacity);
    const model = new Map<string, number>();
    let seed = 123456789;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed;
    };

    for (let i = 0; i < 5000; i++) {
      const key = `key-${random() % 80}`;
      if (random() % 3 === 0) {
        const expected = model.get(key);
        assert.equal(
          cache.getValue(key),
          expected ?? -1,
          `get at operation ${i}`,
        );
        if (expected !== undefined) {
          model.delete(key);
          model.set(key, expected);
        }
      } else {
        const value = random() % 10000;
        cache.addValue(key, value);
        model.delete(key);
        model.set(key, value);
        if (model.size > capacity) {
          const oldest = model.keys().next().value;
          assert.ok(oldest !== undefined);
          model.delete(oldest);
        }
      }
      assertOrder(cache, [...model.keys()]);
      for (const [modelKey, value] of model) {
        assert.equal(cache.valueMap.get(modelKey)?.value, value);
      }
    }
  });

  it("maintains order and capacity for a large number of entries", () => {
    const cache = new LRUCache(1000);
    for (let i = 0; i < 3000; i++) cache.addValue(`key-${i}`, i);
    assertOrder(
      cache,
      Array.from({ length: 1000 }, (_, i) => `key-${i + 2000}`),
    );
    assert.equal(cache.getValue("key-1999"), -1);
    assert.equal(cache.getValue("key-2000"), 2000);
    cache.addValue("new", 3000);
    assert.equal(cache.getValue("key-2001"), -1);
    assertOrder(cache, [
      ...Array.from({ length: 998 }, (_, i) => `key-${i + 2002}`),
      "key-2000",
      "new",
    ]);
  });
});
