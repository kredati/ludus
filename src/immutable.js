// immutable.js
// proof of concept:
// basically a persistent immutable vector like clojure's

// things to add:
// [*] an update function: update(list, index, value)
// [*] an iterator
// [*] a proxy over the list that will allow index addressing
// [*] first/rest semantics
//    [*] first
//    [*] non-naïve rest
// [*] last/but_last semantics
//    [*] last
//    [*] but_last
// [*] write equality algorithm
// [?] add unshift equivalent (prepend)
//     ^ this involves rather more complex bean-counting
//     ^ do not add this until we feel like we need it
// [*] binarize the math to make it more performant
//    [*] adapt scheme to do so from https://hypirion.com/musings/understanding-persistent-vector-pt-2
// [?] loopify get/update operations to make them more performant
//    [ ] again, adapt from https://hypirion.com/musings/understanding-persistent-vector-pt-2
// [-] do perf testing
//    [*] very naive perf results: this slows down as it gets bigger
//        ^ this suggests doing the binary math above
//        ^ did the binary math, indeed it got much faster
//    [ ] do more rigorous perf testing
// [ ] develop testing harness
// [ ] add `tail` optimization: https://hypirion.com/musings/understanding-persistent-vector-pt-3
// [*] add iteration optimization visiting nodes in place of calling `get`

let create = (proto, attrs) => Object.assign(Object.create(proto), attrs);

let eq = (x, y) => x === y;

let last = (arr) => arr[arr.length - 1];
let but_last = (arr) => arr.slice(0, arr.length - 1);

let update_arr = (arr, index, value) => [...arr.slice(0, index), value, ...arr.slice(index + 1)];

let node_factor = 5; // NB: clj has this at 5 // node_size at 32
let node_size = 1 << node_factor; // = 2 ** node_factor

let empty = {show: () => 'empty', eq: (x) => x === empty};

let Leaf = {
  create: (nodes, size = nodes.length) => create(Leaf, {nodes, capacity: node_size - (nodes.length - size), level: 1, size}),
  empty: () => Leaf.create([]),
  get (index) {
    return this.nodes[index];
  },
  update (index, value) {
    let new_nodes = update_arr(this.nodes, index, value);
    return Leaf.create(new_nodes);
  },
  conj (value) { 
    return Leaf.create([...this.nodes, value]);
  },
  but_last () {
    if (this.size === 1) return undefined;
    return Leaf.create(this.nodes.slice(0, this.nodes.length - 1));
  },
  but_first () {
    if (this.size <= 1) return empty;
    let new_nodes = update_arr(this.nodes, this.nodes.length - this.size, empty);
    return Leaf.create(new_nodes, this.size - 1);
  },
  show () {
    return `[${this.nodes.join(', ')}]`;
  },
  eq (leaf) {
    if (this === leaf) return true;
    if (this.size !== leaf.size) return false;
    for (let i = 0; i < this.nodes.length; i++) {
      if (!eq(this.nodes[i], leaf.nodes[i])) return false;
    }
    return true;
  },
  *[Symbol.iterator] () {
    for (let value of this.nodes) {
      if (value !== empty) yield value;
    }
  }
};

let Node = {
  create: (nodes, level, size, offset = 0) =>
    create(Node, {level, nodes, size, offset,
      capacity: (1 << (node_factor * level)) - offset
    }),
  empty: (level) => level === 1
    ? Leaf.empty()
    : Node.create([Node.empty(level - 1)], level, 0),
  get (index) {
    // the following is equivalent to node_size ** (this.level - 1)
    let next_capacity = 1 << (node_factor * (this.level - 1));
    // the following is equivalent to Math.floor(index / next_capacity);
    let which_node = index >>> (node_factor * (this.level - 1));
    // the following is equivalent to index % next_capacity;
    let next_index = index & (next_capacity - 1);
    return this.nodes[which_node].get(next_index);
  },
  update (index, value) {
    let next_capacity = 1 << (node_factor * (this.level - 1));
    let which_node = index >>> (node_factor * (this.level - 1));
    let next_index = index & (next_capacity - 1);
    let new_node = this.nodes[which_node].update(next_index, value);
    return Node.create(
      update_arr(this.nodes, which_node, new_node), this.level, this.size, this.offset);
  },
  conj (value) {
    // if there's room in the current node
    if (this.size < this.capacity) {
      let last_node = last(this.nodes);
      // there's room in the last leaf
      if (last_node.size < last_node.capacity) {
        return Node.create([...but_last(this.nodes), last_node.conj(value)], this.level, this.size + 1, this.offset);
      } else { 
        // or there isn't room, and we need a new sub-node
        return Node.create([...this.nodes, Node.empty(this.level - 1).conj(value)], this.level, this.size + 1, this.offset)
      }
    } else {
      // if the current node is full, create a new node above this one
      return Node.create([this, Node.empty(this.level).conj(value)], this.level + 1, this.size + 1, this.offset)
    }
  },
  conj_leaf (leaf) {
    // if there's room in the current node
    // I think this needs to be special cased more closely
    // the leaf might not be the same size as the node
    // this only happens if somebody unconjes a tail before filling it
    // OY: but just always only send a complete leaf
    if (this.size < this.capacity - node_size) {
      // if this is a bottom `Node` (i.e. that holds leaves, level 2)
      // add the leaf
      if (this.level === 2) return Node.create(
        [...this.nodes, leaf], 2, this.size + node_size, this.offset);
      
      // if this is an internal `Node` (does not hold leaves)
      // add the leaf to the node below
      let last_node = last(this.nodes).conj_leaf(leaf);
      return Node.create(
        [...update_arr(this.nodes, this.nodes.length - 1, last_node)],
        this.level, this.size + node_size, this.offset);
    }
    // if there isn't room, create a new root
    return Node.create([this, Node.empty(this.level).conj_node(node)], 
      this.level + 1, this.size + node_size, this.offset);
  },
  last_leaf () {
    let last_node = last(this.nodes);
    if (this.level === 2) return last_node;
    return last_node.last_leaf();
  },
  unconj_leaf () {
    // if this node is not yet empty // is there a special case here?
    if (this.size <= node_size) return undefined;
    let last_node = last(this.nodes);
    if (this.level === 2) return Node.create(
      [...but_last(this.nodes)], 
      this.level, this.size - last_node.size, this.offset);
    
    let new_last = last(this.nodes).unconj_leaf;
    let new_nodes = new_last
      ? [...but_last(this.nodes), new_last]
      : [...but_last(this.nodes)];
    // fix this: the size calculation will be off when the last node isn't full
    return Node.create(new_nodes, this.level, this.size - last_node.size, this.offset)
  },
  but_last () {
    if (this.size <= 1) return undefined;
    let last_node = last(this.nodes);
    let next_but_last = last_node.but_last();
    let new_nodes = next_but_last 
      ? [...but_last(this.nodes), next_but_last]
      : [...but_last(this.nodes)];
    return Node.create(new_nodes, this.level, this.size - 1, this.offset);
  },
  first_non_empty () {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i] !== empty) return i;
    }
    return -1;
  },
  but_first () {
    if (this.size <= 1) return empty;
    let first_non_empty = this.first_non_empty();
    let new_nodes = update_arr(this.nodes, first_non_empty, this.nodes[first_non_empty].but_first());
    return Node.create(new_nodes, this.level, this.size - 1, this.offset + 1);
  },
  eq (node) {
    if (this === node) return true;
    if (this.size !== node.size) return false;
    for (let i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].eq(node.nodes[i])) return false;
    }
    return true;
  },
  show () {
    return `[${this.nodes.map(node => node.show()).join(', ')}]`;
  },
  *[Symbol.iterator] () {
    for (let node of this.nodes) {
      yield* node[Symbol.iterator]();
    }
  }
};

let list_handler = {
  has (target, prop) {
    if (prop in target) return true;
    let index = parseInt(prop, 10);
    return index >= 0 || index < target.size;
  },
  get (target, prop) {
    if (typeof prop === 'symbol' || prop in target) return target[prop];
    prop
    let index = parseInt(prop, 10);
    if (isNaN(index)) return undefined;
    return target.get(index);
  },
};

let List = {
  create: (root, size, offset = 0) => 
    new Proxy(create(List, {root, size, offset}), list_handler),
  empty: () => List.create(Node.empty(2), 0),
  get (index) {
    if (index < 0 || index >= this.size) return undefined;
    return this.root.get(index + this.offset);
  },
  update (index, value) {
    if (index < 0 || index >= this.size || eq(this.get(index), value)) 
      return this;
    return List.create(this.root.update(index + this.offset, value), this.size, this.offset);
  },
  conj (value) {
    return List.create(this.root.conj(value), this.size + 1, this.offset);
  },
  last () {
    return this.get(this.size - 1);
  },
  but_last () {
    if (this.size <= 1) return List.empty();
    return List.create(this.root.but_last(), this.size - 1, this.offset);
  },
  first () {
    return this.get(this.offset);
  },
  // TODO: fix this naive version for memory leaks
  rest () {
    if (this.size <= 1) return List.empty();
    return List.create(this.root.but_first(), this.size - 1, this.offset + 1);
  },
  of: (...values) => 
    values.reduce((list, value) => list.conj(value), List.empty()),
  from: (iterable) => List.of(...iterable),
  show () {
    return this.root.show();
  },
  eq (list) {
    return this.root.eq(list.root);
  },
  is_empty () {
    return this.size < 1;
  },
  *[Symbol.iterator]() {
    yield* this.root[Symbol.iterator]();
  }
};

export {List};

let range = n => Array.from(Array(n)).map((_, i) => i);

let assert = (message, fn) => {
  let truth = fn();
  if (!truth) {
    throw Error(message);
  }
};

let size = (iter) => iter.size != null 
  ? iter.size 
  : iter.length != null
    ? iter.length
    : undefined

let iter_eq = (iter1, iter2) => {
  if (size(iter1) !== size(iter2)) return false;

  for (let i = 0; i < size(iter1); i++) {
    if (iter1[i] !== iter2[i]) return false;
  }

  return true;
};

let foo = List.from(range(5));
let bar = foo.but_last().conj(foo.last());