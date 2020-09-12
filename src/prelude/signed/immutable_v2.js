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
// [*] add `tail` optimization: https://hypirion.com/musings/understanding-persistent-vector-pt-3
// [x] add `head` optimization
// [*] add iteration optimization visiting nodes in place of calling `get`
// [?] refactor so everything is functions in objects instead of methods
// [*] add ownKeys handler to List proxy to allow key-based looping of List
//     ^ this will allow hashing of vectors in HashedMap
// [*] consider factoring out first/rest modification semantics and only adding
//      and removing at the end; this will simplify matters, since seqs should
//      take care of first/rest iteration semantics

// first, some utility functions

// create an object
let create = (proto, attrs) => Object.freeze(Object.assign(Object.create(proto), attrs));

// strict equality as a function
let eq = (x, y) => x === y;

// get the last element of an array
let last = (arr) => arr[arr.length - 1];

// get all but the last element of an array in a new array
let but_last = (arr) => arr.slice(0, arr.length - 1);

// update a particular element of an array, returning a new array
let update_arr = (arr, index, value) => [...arr.slice(0, index), value, ...arr.slice(index + 1)];

let chunk = (arr, by) => {
  let chunked = [];
  let chunks = 0;
  while (chunks * by < arr.length) {
    let start = chunks * by;
    let stop = (chunks + 1) * by;
    chunked.push(arr.slice(start, stop));
    chunks += 1;
  }
  return chunked;
}

///// Defaults
// node_factor is the power of two that expresses node size
let node_factor = 2; // NB: clj has this at 5 // node_size at 32
// calculate node size
let node_size = 1 << node_factor; // = 2 ** node_factor

// a special empty element
let empty = {show: () => 'empty', eq: (x) => x === empty};

let Leaf = {
  create: (nodes) => create(Leaf, {nodes, capacity: node_size, level: 1, size: nodes.length}),
  empty: () => Leaf.create([]),
  is_empty () {
    return this.size === 0;
  },
  is_full () {
    return this.size >= node_size;
  },
  get (index) {
    return this.nodes[index];
  },
  last () {
    return last(this.nodes);
  },
  update (index, value) {
    let new_nodes = update_arr(this.nodes, index, value);
    return Leaf.create(new_nodes);
  },
  conj (value) { 
    return Leaf.create([...this.nodes, value]);
  },
  unconj () {
    if (this.size === 1) return undefined;
    return Leaf.create(but_last(this.nodes));
  },
  show () {
    return `Leaf [ ${this.nodes.join(', ')} ]`;
  },
  inspect () {
    return this.show();
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
  create: (nodes, level, size) =>
    create(Node, {level, nodes, size,
      capacity: (1 << (node_factor * level))
    }),
  empty: (level = 2) => level === 2
    ? Node.create([], level, 0)
    : Node.create([Node.empty(level - 1)], level, 0),
  is_empty () {
    return this.size === 0;
  },
  is_full () {
    return this.size >= this.capacity;
  },
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
      update_arr(this.nodes, which_node, new_node), this.level, this.size);
  },
  conj (leaf) {
    if (this.size < this.capacity) {
      // if this is a bottom `Node` (i.e. that holds leaves, level 2)
      // add the leaf
      if (this.level === 2) return Node.create(
        [...this.nodes, leaf], 2, this.size + node_size);
      
      // if this is an internal `Node` (does not hold leaves)
      // add the leaf to the node below
      let new_last_node = last(this.nodes).conj(leaf);
      return Node.create(
        update_arr(this.nodes, this.nodes.length - 1, new_last_node),
        this.level, this.size + node_size);
    }
    // if there isn't room, create a new root
    return Node.create([this, Node.empty(this.level).conj(leaf)], 
      this.level + 1, this.size + node_size);
  },
  last () {
    let last_node = last(this.nodes);
    if (this.level === 2) return last_node;
    return last_node.last();
  },
  unconj () {
    if (this.level === 2) {
      let new_nodes = but_last(this.nodes);
      return Node.create(new_nodes, 2, new_nodes.length * node_size)
    }

    let new_last = last(this.nodes).unconj();

    let new_nodes = new_last.is_empty()
      ? [...but_last(this.nodes)]
      : [...but_last(this.nodes), new_last];

    return new_nodes.length === 1 
      ? new_nodes[0]
      : Node.create(new_nodes, this.level, this.size - node_size);
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
    return `Node [ ${this.nodes.map(node => node.show()).join(', ')} ]`;
  },
  inspect () {
    return this.show();
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
    let index = parseInt(prop, 10);
    if (isNaN(index)) return undefined;
    return target.get(index);
  },
  ownKeys (target) {
    return Array.from(Array(target.size), (_, i) => String(i));
  }
};

let Arr = {
  create: (root, tail, size) => 
    new Proxy(create(Arr, {root, tail, size}), list_handler),
  empty: () => Arr.create(Node.empty(), Leaf.empty(), 0),
  get (index) {
    if (index < 0 || index >= this.size) return undefined;
    return index < this.root.size 
      ? this.root.get(index)
      : this.tail.get(index - this.root.size);
  },
  update (index, value) {
    if (index < 0 || index >= this.size || eq(this.get(index), value)) 
      return this; // is this the behavior we want?
    if (index > this.root.size) {
      let tail_index = index - this.root.size
      return Arr.create(this.root, this.tail.update(tail_index, value), this.size)
    }
    return Arr.create(this.root.update(index, value), this.tail, this.size);
  },
  conj (value) {
    return this.tail.is_full() 
      ? Arr.create(this.root.conj(this.tail), Leaf.create([value]), this.size + 1)
      : Arr.create(this.root, this.tail.conj(value), this.size + 1);
  },
  last () {
    return this.tail.last();
  },
  unconj () {
    if (this.size <= 1) return Arr.empty();
    if (this.tail.size <= 1) {
      let new_tail = this.root.last();
      let new_root = this.root.unconj();
      return Arr.create(new_root, new_tail, this.size - 1);
    }
    return Arr.create(this.root, this.tail.unconj(), this.size - 1);
  },
  of: (...values) => 
    values.reduce((list, value) => list.conj(value), Arr.empty()),
  from: (iterable) => {
    if (Arr.is_arr(iterable)) return iterable;
    if (Array.isArray(iterable)) {
      let chunks = chunk(iterable, node_size);
      let tail = Leaf.create(last(chunks) || []);
      let root = Node.empty();
      for (let chunk of but_last(chunks)) {
        root = root.conj(Leaf.create(chunk));
      }
      return Arr.create(root, tail, iterable.length);
    }
    return Arr.of(...iterable);
  },
  show () {
    return this.root.show();
  },
  inspect () {
    return this.show();
  },
  eq (list) {
    if (this === list) return true;
    if (list == null) return false;
    if (Arr.is_list(list) && this.root.eq(list.root)) return true;
    let size = list.size || list.length;
    if (size == null || size != this.size) return false;
    for (let i = 0; i < size; i++) {
      if (!eq(this.get(i), list[i])) return false;
    }
    return true;
  },
  is_arr: (arr) => arr == null || typeof arr !== 'object'
      ? false
      : Reflect.getPrototypeOf(arr) === Arr,
  is_empty () {
    return this.size < 1;
  },
  *[Symbol.iterator]() {
    yield* this.root[Symbol.iterator]();
    yield* this.tail[Symbol.iterator]();
  },
  [Symbol.isConcatSpreadable]: true,
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return `[${[...this].join(', ')}]`;
  }
};
Arr.empty().conj('foo').conj('bar') //?
Arr.of(1, 2, 3, 4, 5, 6, 7, 8).conj(9); //?
Arr.from([]).conj(1).conj(2) //?

export {Arr};
