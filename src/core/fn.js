import '../prelude/prelude.js';

let call = fn({
    name: 'call',
    doc: 'Takes a function and a set of arguments--as arguments--and calls the function with those arguments.',
    pre: args([is_fn], [is_fn, is_any]),
    body: (fn, ...args) => fn(...args)
});

let apply = fn({
    name: 'apply',
    doc: 'Takes a function and a sequence of arguments and calls the fucntion with that sequence of arguments.',
    pre: args([is_fn, is_sequence]),
    body: (fn, args) => fn(...args)
});

let ap = fn({
    name: 'ap',
    doc: 'Takes a sequence with the function in the first position and its arguments after, and applies the arguments to that function.',
    pre: args([is_sequence]),
    body: ([fn, ...args]) => fn(...args)
});

let thunk = fn({
    name: 'thunk',
    doc: 'Represents a deferred computation: takes a function and a set of arguments and returns a nullary function that will apply the arguments to that function when it is called.',
    pre: args([is_fn], [is_fn, is_any]),
    body: (fn, ...args) => {
        let name = `thunk<${get('name', fn)}(${Str.from(map(Ludus.show, args), ', ')})>`;
        let body = () => fn(...args);
        return Fn.fn(name, body)
    }
});

export default ns(Fn, {call, apply, ap, thunk});