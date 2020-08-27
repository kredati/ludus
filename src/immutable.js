// immutable.js
// proof of concept:
// basically a persistent immutable vector like clojure's

// things to add:
// [*] an update function: update(list, index, value)
// [*] an iterator
// [*] a proxy over the list that will allow index addressing
// [-] first/rest semantics
//    [*] first
//    [ ] non-naïve rest
// [-] last/but_last semantics
//    [*] last
//    [ ] but_last
// [ ] write equality algorithm
// [ ] binarize the math to make it more performant
//    [ ] adapt scheme to do so from https://hypirion.com/musings/understanding-persistent-vector-pt-2
// [?] loopify get/update operations to make them more performant
//    [ ] again, adapt from https://hypirion.com/musings/understanding-persistent-vector-pt-2
// [-] do perf testing
//    [ ] very naive perf results: this slows down as it gets bigger
//        ^ this suggests doing the binary math above
// [ ] do unit testing

let create = (proto, attrs) => Object.assign(Object.create(proto), attrs);

let eq = (x, y) => x === y;

let last = (arr) => arr[arr.length - 1];
let but_last = (arr) => arr.slice(0, arr.length - 1);

let update_arr = (arr, index, value) => arr[index] === value
  ? arr
  : [...arr.slice(0, index), value, ...arr.slice(index + 1)];

let node_factor = 5; // NB: clj has this at 5 // node_size at 32
let node_size = 1 << node_factor; // = 2 ** node_factor
let mask = node_size - 1; // = bitwise mask for bitflipping

let Leaf = {
  create: (nodes) => create(Leaf, {nodes, capacity: node_size, level: 1}),
  empty: () => Leaf.create([]),
  get (index) {
    return this.nodes[index] 
  },
  update (index, value) {
    let new_nodes = update_arr(this.nodes, index, value);
    return new_nodes === this.nodes
      ? this
      : Leaf.create(new_nodes);
  },
  conj (value) { 
    return Leaf.create([...this.nodes, value]) 
  },
  get size () {
    return this.nodes.length;
  },
  show () {
    return `[${this.nodes.join(', ')}]`
  }
};

let Node = {
  create: (nodes, level, size) =>
    create(Node, {level, nodes, size,
      capacity: nodes[0].capacity << node_factor // = node_size ** level
    }),
  empty: (level) => level === 1
    ? Leaf.empty()
    : Node.create([Node.empty(level - 1)], level, 0),
  get (index) {
    let next_capacity = this.nodes[0].capacity;
    // let which_node = Math.floor(index / next_capacity);
    let which_bit = index >>> (node_factor * (this.level - 1));
    // let next_index = index % next_capacity;
    let bit_index = index & (next_capacity - 1);
    return this.nodes[which_bit].get(bit_index);
  },
  update (index, value) {
    let next_capacity = this.nodes[0].capacity;
    let which_node = Math.floor(index / next_capacity);
    let next_index = index % next_capacity;
    let new_node = this.nodes[which_node].update(next_index, value);
    return Node.create(update_arr(this.nodes, which_node, new_node), this.level);
  },
  conj (value) {
    // if there's room in the current node
    if (this.size < this.capacity) {
      let last_node = last(this.nodes);
      // there's room in the last leaf
      if (last_node.size < last_node.capacity) {
        return Node.create([...but_last(this.nodes), last_node.conj(value)], this.level, this.size + 1);
      } else { 
        // or there isn't room, and we need a new sub-node
        return Node.create([...this.nodes, Node.empty(this.level - 1).conj(value)], this.level, this.size + 1)
      }
    } else {
      // if the current node is full, create a new node above this one
      return Node.create([this, Node.empty(this.level).conj(value)], this.level + 1, this.size + 1)
    }
  },
  // TODO: write these so that they delete the (ir)relevant parts of the tree
  but_last () {},
  but_first () {},
  show () {
    return `[${this.nodes.map(node => node.show()).join(', ')}]`;
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
    let index = parseInt(prop, 10);
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
    return List.create(this.root.conj(value), this.size + 1);
  },
  last () {
    return this.get(this.size - 1);
  },
  but_last () {
    if (this.size <= 1) return List.empty();
    return List.create(this.root.but_last(), this.size - 1, this.offset);
  },
  first () {
    return this.get(0);
  },
  // TODO: fix this naive version for memory leaks
  rest () {
    return List.create(this.root, this.size - 1, this.offset + 1);
  },
  of: (...values) => 
    values.reduce((list, value) => list.conj(value), List.empty()),
  from: (iterable) => List.of(...iterable),
  show () {
    return this.root.show();
  },
  *[Symbol.iterator]() {
    let lower = this.offset;
    let upper = this.size + this.offset;
    for (let i = lower; i < upper; i++) {
      yield this.root.get(i);
    }
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

let runtest = (tests) => {
  for (let i = 0; i < tests * 100; i++) {
    assert(`array vector eq with ${i} elements`, () => iter_eq(range(i), List.from(range(i))));
  }
  return `successful array vector eq between 0 and ${tests}`
};