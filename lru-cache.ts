class ListNode {
  public key: string;
  public value: number;
  public previous: ListNode | null;
  public next: ListNode | null;

  constructor(
    key: string,
    value: number,
    previous: ListNode | null,
    next: ListNode | null,
  ) {
    this.key = key;
    this.value = value;
    this.previous = previous;
    this.next = next;
  }
}

class LRUCache {
  public readonly capacity: number = 5;
  public tailNode: ListNode | null = null;
  public headNode: ListNode | null = null;
  public valueMap = new Map<string, ListNode>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  public getValue(key: string): number {
    if (!this.valueMap.has(key)) {
      return -1;
    } else {
      const node: ListNode = this.valueMap.get(key) as ListNode;
      this.moveToHead(node);
      return node.value;
    }
  }

  public addValue(key: string, value: number) {
    if (this.valueMap.has(key)) {
      const node: ListNode = this.valueMap.get(key) as ListNode;
      node.value = value;
      this.moveToHead(node);
    } else {
      const node: ListNode = new ListNode(key, value, null, null);
      this.moveToHead(node);
      this.valueMap.set(key, node);

      if (this.valueMap.size > this.capacity && this.tailNode) {
        this.valueMap.delete(this.tailNode.key);

        const nodeToDelete = this.tailNode;
        this.tailNode = nodeToDelete.next;

        if (!this.tailNode) {
          this.headNode = null;
        } else {
          this.tailNode.previous = null;
        }
      }
    }
  }

  private moveToHead(node: ListNode) {
    if (node == this.headNode) {
      return;
    }

    if (this.headNode == null) {
      this.headNode = node;
      this.tailNode = node;

      return;
    }

    if (node == this.tailNode && this.tailNode.next) {
      this.tailNode = this.tailNode.next;
      this.tailNode.previous = null;
    } else if (node.previous && node.next) {
      node.previous.next = node.next;
      node.next.previous = node.previous;
    }

    node.next = null;
    this.headNode.next = node;
    node.previous = this.headNode;
    this.headNode = node;
  }
}


export { LRUCache }
const lruCache = new LRUCache(2);
lruCache.addValue("1", 1);
console.log("Cache hit 1: ", lruCache.getValue("1"));
lruCache.addValue("2", 2);

console.log("Cache hit 2: ", lruCache.getValue("2"));
console.log("Cache hit 1: ", lruCache.getValue("1"));
lruCache.addValue("3", 3);
lruCache.addValue("2", 5);

console.log("Cache hit 1: ", lruCache.getValue("1"));
console.log("Cache hit 2: ", lruCache.getValue("2"));
console.log("Cache hit 3: ", lruCache.getValue("3"));

console.log("Capacity ", lruCache.capacity);
