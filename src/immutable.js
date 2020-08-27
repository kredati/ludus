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
// [ ] binarize the math to make it more performant'
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

let node_factor = 3; // NB: clj has this at 5 // node_size at 32
let node_size = 2 ** node_factor;

let Leaf = {
  create: (values) => create(Leaf, {values}),
  empty: () => Leaf.create([]),
  get (index) {
    return this.values[index] 
  },
  update (index, value) {
    let new_values = update_arr(this.values, index, value);
    return new_values === this.values
      ? this
      : Leaf.create(new_values);
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

let Node = {
  create: (nodes, level) => create(Node, 
    {level, nodes, 
      size: nodes.reduce((x, node) => x + node.size, 0),
      capacity: node_size ** level
    }),
  empty: (level) => level === 2
    ? Node.create([Leaf.empty()], level)
    : Node.create([Node.empty(level - 1)], level),
  get (index) {
    let next_capacity = node_size ** (this.level - 1);
    let which_node = Math.floor(index / next_capacity);
    let next_index = index % next_capacity;
    return this.nodes[which_node].get(next_index);
  },
  update (index, value) {
    let next_capacity = node_size ** (this.level - 1);
    let which_node = Math.floor(index / next_capacity);
    let next_index = index % next_capacity;
    let new_node = this.nodes[which_node].update(next_index, value);
    return new_node === this.nodes[which_node]
      ? this
      : Node.create(update_arr(this.nodes, which_node, new_node), this.level);
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
    return List.create(new_root, this.size, this.offset);
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
    for (let i = 0; i < this.size; i++) {
      yield this.get(i);
    }
  }
};

export {List};