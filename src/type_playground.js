let Type = Object.create(null);
Type[Symbol.iterator] = function() {
  return this.ns.iterate(this)[Symbol.iterator]();
};
Type.show = function() {
  return 'ns' in this && 'show' in this.ns
    ? this.ns.show(this)
    : `${this.name}{}`;
};
Type.inspect = function() {
  return this.show();
};
Type[Symbol.toStringTag] = function() {
  return this.name;
}

let deftype = (name, doc) => {
  let proto = Object.create(Type);
  return Object.defineProperties(
    proto,
    {
      name: {value: name},
      doc: {value: doc},
      t: {value: proto}
    });
};

let register_ns = (type, ns) => Object.defineProperty(type, 'ns', {value: ns});

let is_type = (obj) => obj != undefined && Object.getPrototypeOf(obj) === Type;

let create = (proto, attrs) => {
  let created = Object.create(proto);
  for (let key in attrs) {
    Object.defineProperty(created, key, {value: attrs[key]});
  }
  return created;
};

export {deftype, register_ns, is_type, create};

let List = deftype('List', 'a linked list');
register_ns(List, {});

let list = create(List, {foo: 'bar'}) //?

Object.prototype //?
Array.prototype //?
Number.prototype //?
String.prototype //?
Symbol.prototype //?
BigInt.prototype //?
