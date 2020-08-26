// immutable.js
// proof of concept:
// basically a persistent immutable vector like clojure's

// things to add:
// - an update function: update(list, index, value)
// - an iterator
// - a proxy over the list that will allow index addressing
// - first/rest semantics
// - binarize the math to make it more performant?

let create = (proto, attrs) => Object.assign(Object.create(proto), attrs);

let node_factor = 3;
let node_size = 2 ** node_factor;
node_size

let Leaf = {
  create: (values) => create(Leaf, {values}),
  empty: () => Leaf.create([]),
  get (which) {
    return this.values[which] 
  },
  conj (value) { 
    return Leaf.create([...this.values, value]) 
  },
  get size () {
    return this.values.length;
  },
  show () {
    return `[${this.values.join(', ')}]`
  },
  get capacity () {
    return node_size;
  }
};

let last = (arr) => arr[arr.length - 1];
let but_last = (arr) => arr.slice(0, arr.length - 1);

let Node = {
  create: (nodes, level) => create(Node, 
    {level, nodes, 
      size: nodes.reduce((x, node) => x + node.size, 0),
      capacity: node_size ** level
    }),
  empty: (level) => level === 2
    ? Node.create([Leaf.empty()], level)
    : Node.create([Node.empty(level - 1)], level),
  get (which) {
    let next_capacity = node_size ** (this.level - 1);
    let which_node = Math.floor(which / next_capacity);
    let next_which = which % next_capacity;
    return this.nodes[which_node].get(next_which);
  },
  conj (value) {
    // if there's room in the current node
    if (this.size < this.capacity) {
      // there's room in the last leaf
      if (last(this.nodes).size < (node_size ** (this.level - 1))) {
        return Node.create([...but_last(this.nodes), last(this.nodes).conj(value)], this.level);
      } else { // or there isn't room, and we need a new leaf
        return Node.create([...this.nodes, Leaf.empty().conj(value)], this.level)
      }
    } else { 
      // if the current node is full, create a new node above this one
      return Node.create([this, Node.empty(this.level).conj(value)], this.level + 1)
    }
  },
  show () {
    return `[${this.nodes.map(node => node.show()).join(', ')}]`;
  }
};

let List = {
  create: (root, size) => create(List, {root, size}),
  empty: () => List.create(Node.empty(2), 0),
  get (which) {
    if (which < 0 || which >= this.size) return undefined;
    return this.root.get(which);
  },
  conj (value) {
    return List.create(this.root.conj(value), this.size + 1);
  },
  of: (...values) => 
    values.reduce((list, value) => list.conj(value), List.empty()),
  show () {
    return this.root.show();
  }
};

