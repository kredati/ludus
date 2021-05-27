let rename = (name, fn) => Object.defineProperty(fn, 'name', {value: name}); 

let create_token = Symbol('ludus/create');
let constructor_tag = Symbol('ludus/constructor');

let create = (constructor, {params = [], ...attrs}) =>
  constructor[constructor_tag]
    ? new constructor(create_token, attrs)
    : Object.assign(new constructor(...params), attrs);

let deftype = ({name, predicates = {}, ...attrs}) => {
  let clazz = rename(name, class Clazz {
    constructor(token, attrs) {
      if (token !== create_token) 
        throw Error(`${name} must be created using \`create\`.`)
        for (let key in predicates) {
          if (!predicates[key](attrs[key]))
            throw Error(`Can't construct ${name}. Invalid field ${key}: ${attrs[key]} failed predicate ${predicates[key].name || predicates[key].toString()}.`);
        }
        return Object.assign(this, attrs);
    }
  });
  return Object.assign(clazz, {...attrs, [constructor_tag]: true});
};

let is_number = (x) => typeof x === 'number';

let Foo = deftype({
  name: 'Foo',
  doc: `here's some mock doc`,
  predicates: {foo: is_number}
});



let foo = create(Foo, {foo: 0}); //?

let set = create(Set, {params: [[2, 3, 4, 4, 5]]})
set

let bar = {foo: 42};
bar.constructor

let assoc = (obj, key, value) => {
  if (obj[key] === value) return obj;
  let new_obj = {...obj, [key]: value};
  return create(obj.constructor, new_obj)
};

create(Object, {foo: 42}) //?
assoc({}, 'foo', '42') //?
assoc(foo, 'foo', 0) === foo //?