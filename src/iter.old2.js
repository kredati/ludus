// a Ludus-flavored take on Clojure's transducers
// this is much more functionally-oriented than transduers.js
// the api is simpler (not easier!)--
// nothing is overloaded here; clj involves lots of conditional behaviour
// * no overloading transformer signatures
// * e.g., in clj:
//   - map/1 :: map(a -> b) -> xform(coll(a) -> coll(b))
//   - map/2 :: map(coll(a), a -> b) -> coll(b)
// * vs. here:
//   - map :: map(a -> b) -> xform(coll(a) -> coll(b))
// * note the signature here is much more complex 
//   - will work it out later, when I wrap this with types
// also: no prototypes; only modules--
// it optimizes iteration through arrays and objects in two ways
// * it uses mutable versions during iteration (for strs, arrs, and objs)
// * it applies transformations in a single pass without intermediate steps

// TODO: // or to consider
// * figure out how to create lazy generators (e.g. in `into` and `seq`) [DONE]
// * decide how to handle the impulse for map(x => x + 1) to take a collection
//   - with partial application, you'd want `Iter.seq(__, map(x => x + 1))`
//     or `Iter.xform(map(x => x + 1))`
//   - that said, simple module-based functions make senese: 
//     `Arr.map(__, x => x + 1)`, OR:
//   - with polymorphic dispatch, you can use `Meta.map(__, x => x + 1)`
// * consider implementing the transducer protocol
//   - can I, with the modules approach? it seems prototype-ish
//   - that said, some version of it seems wise for `list`
//     * to be able to do mutable work on lists?
// * design/re-implement the remaining transformations: these require flushing
//   - chunk (partition) [DONE-ish]
//     * this is easy if we don't flush any unchunked elements
//     * chunk_by is impossible without flushing
//   - interpose, zip
//     * versions of these are easy:
//     * seq([1, 2, 3], interpose(0)) -> [1, 0, 2, 0, 3, 0] :: easy
//     * seq([1, 2, 3], interpose(0)) -> [1, 0, 2, 0, 3] :: hard
//     * zip([1, 2, 3], ['a', 'b']) -> [1, 'a', 2, 'b'] :: easy
//     * zip([1, 2, 3], ['a', 'b']) -> [1, 'a', 2, 'b', 3] :: hard 
//       - not sure about the difficulty of zip (could be wrong)
//   - the question is whether the "easy" versions are (less | equally | more)
//     desirable than the clj versions. e.g. it seems equally sane to decide
//     chunk the list into same-length tuples and discard those that don't fit


//////// symbols
const append = Symbol.for('ludus/iter/append')
const empty = Symbol.for('ludus/iter/empty')

const result = Symbol.for('ludus/iter/result')
const reduced = Symbol.for('ludus/iter/reduced')
const unreduced = Symbol.for('ludus/iter/unreduced')

//////// conditional helpers
T = () => true
F = () => false

const cond = (...clauses) => {
    for (const [guard, result] of clauses) {
        if (guard) return result()
    }
}

//////// add append & empty functions on type representatives
String[append] = (first, second) => first + second
String[empty] = () => ''

Array[append] = (arr, el) => (arr.push(el), arr)
Array[empty] = () => []

Object[append] = (obj, [key, value]) => { obj[key] = value; return obj }
Object[empty] = () => ({})

Set[append] = (set, value) => (set.add(value), set)
Set[empty] = () => new Set()

Map[append] = (map, [key, value]) => (map.set(key, value), map)
Map[empty] = () => new Map()

//////// a quick and dirty linked list implementation
const Cons = {
    cons: (value, next = Cons.end) => {
        const cell = {value, next, [Symbol.for('ludus/module')]: Cons}
        cell[Symbol.iterator] = () => Cons[Symbol.for('ludus/iterator')](cell)
        return Object.freeze(cell)
    },
    of: (value) => Cons.cons(value),
    list: (...elements) => elements
        ? elements.reduceRight(
            (next, value) => Cons.cons(value, next), Cons.end)
        : Cons.end,
    head: ({value}) => value,
    tail: ({next}) => next,
    [Symbol.for('ludus/iterator')]: cons => {
        let list = cons
        return {
            next: () => {
                if (list === Cons.end) return {value: null, done: true}
                const value = Cons.head(list)
                list = Cons.tail(list)

                return {
                    value,
                    done: false
                }
            }
        }
    },
    [empty]: () => Cons.list(),
    [append]: (list, value) => Cons.list(...list, value)
}

// add a special list terminator object
// it needs to be added here as a property because it's circular
// it needs to be an object so it can also be iterated
Cons.end = {
    [Symbol.iterator]: () => ({next: () => ({value: null, done: true})}),
    [Symbol.for('ludus/module')]: Cons
}

//////// iterator & module inference helpers
// will be *much* cleaner in the context of Ludus
const is_iterable = x => 
    x != null && 
    Symbol.iterator in x

const get_iterator = x => cond(
    [is_iterable(x), () => x],
    [typeof x === 'string', () => x],
    [typeof x === 'function', () => x()],
    [x != null && typeof x === 'object', () => cond(
        [Symbol.for('ludus/module') in x &&
            Symbol.for('ludus/iterator') in x[Symbol.for('ludus/module')],
                () => x[Symbol.for('ludus/module')][Symbol.for('ludus/iterator')](x)],
        [true, () => Object.entries(x)]
    )]
)

const infer_object = obj => cond(
    [obj instanceof Map, () => Map],
    [obj instanceof Set, () => Set],
    [Symbol.for('ludus/module') in obj,
        () => obj[Symbol.for('ludus/module')]],
    [true, () => Object]
)

const infer = iterable => cond(
    [Array.isArray(iterable), () => Array],
    [typeof iterable === 'string', () => String],
    [typeof iterable === 'function', () => Function],
    [iterable != null && typeof iterable === 'object',
        () => infer_object(iterable)]
)

//////// an accumulator object
// this will be an interface

// our standard accumulator
const accumulator = value => ({
    [reduced]: false,
    [result]: value
})

// an accumulator for a short-circuited reduction
// e.g. in `take`
const finish = value => ({
    [reduced]: true,
    [result]: value
})

const flush = (value, flush) => ({
    [result]: value,
    [unreduced]: flush
})

// tells us if we have an accumulator in our hands
const is_accumulator = acc => 
    acc != null && 
    typeof acc === 'object' && 
    result in acc

// "lifts" a function to work with accumulators instead of plain values
const lift = f => (acc, x) => {
    const res = f(acc[result], x)
    
    if (is_accumulator(res)) return Object.assign(acc, res)
    
    acc[result] = res
    
    return acc
}

//////// fold
// a fold/reduce impelementation that is iterator-agnostic
// this is the base of transduction
const fold = (iterable, fn, first) => {
    // make sure we have the iterable we want
    const iterator = get_iterator(iterable)
    
    // lift the first element into an accumulator
    // this is where we'd ask for an init:
    // we'd delegate this to the module:
    // const init = infer(first)[init] || Fn.just(first)
    // let acc = accumulator(init())
    let acc = accumulator(first)

    // loop through the iterable using the JS iteration protocol
    for (const element of iterator) {
        // lift and apply the reducing function
        acc = lift(fn)(acc, element)

        // short circuit the loop if our reduction is complete
        if (acc[reduced]) break
    }

    if (acc[unreduced]) acc = lift(acc[unreduced])(acc)

    // and return our unwrapped result
    // this is where we'd ask for a result
    // const get_result = infer(acc[result])[result] || Fn.just(acc[result])
    // return get_result()
    return acc[result]
}

// transduce applies a reducer to a transformer:
// it transforms a list, and then reduces it
const transduce = (iterable, transformer, reducer, first) => 
    fold(iterable, transformer(reducer), first)

const seq = (iterable, transformer) => {
    const type = infer(iterable)

    if (type === Function) return lazy(iterable, transformer)

    return transduce(
        iterable,
        transformer,
        type[append],
        type[empty]())
}

const into = (collector, iterable, transformer = filter(() => true)) => {
    const type = infer(collector)

    return transduce(
        iterable,
        transformer,
        type[append],
        collector
    )
}

const xform = (...xforms) => iterable => seq(iterable, compose(...xforms))

//////// transformation functions

// the transformation functions compose using normal function composition
// however, note that the order is reversed from the intuitive order
// use `compose` like you would `pipe`
const compose = (...fs) => x => fs.reduceRight((res, f) => f(res), x)

const map = f => append => (iter, x) => append(iter, f(x))

// helper mappers: commonly used transformations
// only send the key along from a [key, value] tuple
const keys = map(([key]) => key)
// only send the value along from a [key, value] tuple
const values = map(([, value]) => value)

const filter = f => append => (iter, x) => 
    f(x) ? append(iter, x) : iter

const remove = f => filter(Fn.not(f))

const take = n => {
    let count = 0
    return append => (iter, x) => {
        count += 1
        return count <= n
            ? append(iter, x)
            : finish(iter)
    }
}

const take_while = f => append => (iter, x) => 
    f(x) ? append(iter, x) : finish(iter)

const take_nth = n => {
    let count = 0
    return append => (iter, x) => {
        count += 1
        return count % n === 0
            ? append(iter, x)
            : iter
    }
}

const drop = n => {
    let count = 0
    return append => (iter, x) => {
        count += 1
        return count <= n 
            ? iter
            : append(iter, x)
    }
}

const drop_while = f => append => (iter, x) => 
    f(x) ? iter : append(iter, x)

// the equivalent of clj's `partition`
const chunk = n => append => {
    let current = []
    return (iter, x) => {
        current.push(x)
        if (current.length >= n) {
            const chunked = current
            current = [] 
            return append(iter, chunked) 
        }
        return flush(
            iter, 
            iter => current.length ? append(iter, current) : iter
        )
    }
}

const interpose = value => append => {
    let previous
    return (iter, x) => {
        const curr = previous
        previous = x
        if (curr == null) return iter
        return flush(
            append(append(iter, curr), value),
            iter => append(iter, previous))
    }
}

// TODO: fix error/bug with `flush` semantics
// clearly this has to do with the ways the flush doesn't compose
// right now it is just copied across
// and also may well be called out of order
seq([1, 2, 3], compose(
    chunk(2),
    interpose('foo')
)) //-> should be [[1, 2], 'foo', [3]]
seq([1, 2, 3], compose(
    interpose('foo'),
    chunk(2)
)) //-> should be [[1, 'foo'], [2, 'foo'], [3]]

const unique = append => {
    const members = new Set()
    return (iter, x) => {
        if (members.has(x)) return iter
        members.add(x)
        return append(iter, x)
    }
}

const cat = append => (iter, x) => fold(x, append, iter)

const dedupe = append => {
    let compare = Symbol('compare')
    return (iter, x) => {
        if (x === compare) return iter
        compare = x
        return append(iter, x)
    }
}

//////// reducing functions
// special reducers that short-circuit
const some = (iter, f) => fold(iter, (_, x) => f(x) ? finish(true) : false)

const every = (iter, f) => fold(iter, (_, x) => f(x) ? true : finish(false))

const none = (iter, f) => fold(iter, (_, x) => f(x) ? finish(false) : true)

//////// generator functions
// a little wrapper that lets us use lambdas (not function*)
// also includes a maximum count to avoid infinite loops
// note that done is a function that is the condition for *stopping*
// (may reverse that decision later)
const generate = (f, seed, done = F, max_count = 10000000) => 
    function* generator () {
        let acc = seed
        let count = 0
        while (!done(acc) && count <= max_count) {
            if (acc != null) yield acc
            acc = f(acc)
            count += 1
        }
        if (count >= max_count) throw Error('Maxiumum gneration size reached.')
    }

// a range function that produces an iterable
// note that max is a max for the range, not a number of steps
const range = (start, max, step = x => x + 1) => 
    generate(step, start, x => x >= max)()

const repeat = n => append => (iter, x) => {
    for (const _ of range(0, n)) {
        iter = append(iter, x)
    }

    return iter
}

/////////////////////////////////// lazy workspace
const lazy = (iterable, transformer) => function* () {
    const iterator = get_iterator(iterable)[Symbol.iterator]()

    while (true) {
        const next = iterator.next()
        const container = []
        
        if (next.done) return

        let acc = accumulator(container)
        acc = lift(transformer(Array[append]))(acc, next.value)

        while (container.length) yield container.shift()

        if (acc[reduced]) return
    }
}

///////////////////////////////// examples

// reducing a list
fold(
    Cons.list(1, 2, 3, 4),
    (x, y) => x + y,
    0
) //-> 10

// basic transduction: turn an array into a list, while filtering
transduce(
    [1, 2, 3, 4],
    compose(
        filter(x => x % 2 === 0),
        map(x => x + 1)),
    Cons[append],
    Cons[empty]()
) //-> (3, 5)

// `seq` creates a new collection of the same type, applying a transformation
seq(Cons.list(1, 2, 3, 4), map(x => x + 1))
//-> (2, 3, 4, 5)

// `dedupe` removes consecutive duplicates
seq([1, 1, 2, 3, 3, 3, 4, 3], dedupe)
//-> [1, 2, 3, 4, 3]

// repeat repeats values
seq(['a', 'b', 'c'], repeat(3))
//-> ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c']

// take_nth only takes values % n === 0
// take_nth(2) takes every other; take_nth(3) takes every third
seq([1, 2, 3, 4, 5, 6], take_nth(2)) //-> [2, 4, 6]
seq([1, 2, 3, 4, 5, 6], take_nth(3)) //-> [3, 6]

// `into` "pours" values into a new collection
// note that the collection must have `empty` and `append` functions
into(Cons.list(), [1, 2, 3, 4])
//-> (1, 2, 3, 4)

// it applies a transformation if specified
into([], Cons.list(1, 2, 3, 4), map(x => x * 2))
//-> [2, 4, 6, 8]

// the last argument's default is (filter(T)),
// so it just passes elements along
into([], {a: 1, b: 2}) //-> [['a', 1], ['b', 2]]
into({}, {a: 1, b: 2}) //-> {a: 1, b: 2}

// records are valid collections!, with [key, value] tuples
into(
    {}, 
    range(0, 7), 
    compose(
        filter(x => x % 2 === 0),
        map(x => [`${x}`, x * x])))
//-> {'0': 0, '2': 4, '4': 16, '6': 36}

// function generators can effectively do what we want generators to
// the trick: use a closure for state and `return` instead of `yield`
// Fibonacci generator example
const fib_gen = () => {
    let acc = [1, 0]
    return () => {
        const [n_1, n_2] = acc
        const n = n_1 + n_2
        acc = [n, n_1]
        return n
    }
}

// this generator will maintain state
const fib = generate(fib_gen())
into([], fib(), take(5)) //-> [1, 2, 3, 5, 8]
into([], fib(), take(3)) //-> [13, 21, 34]

// to start over, make a generator factory function
const fibber = () => generate(fib_gen())()
into([], fibber(), take(3)) //-> [1, 2, 3]
into([], fibber(), take(3)) //-> [1, 2, 3]

// range generators
// note that ranges are always seperate
into([], range(0, 10)) //-> [0..10]
into([], range(0, 10)) //-> [0..10]

// the second number in range is a max, not a size
into([], range(0, 10, x => x + 2)) //-> [0, 2, 4, 6, 8]

// powers of 2 generation
const powers_of_2 = generate(x => x * 2, 1)

into([], powers_of_2(), take_while(x => x < 50))
//-> [1, 2, 4, 8, 16, 32]
into([], powers_of_2(), take(3))
//-> [64, 128, 256]

// reducers 
// they short circuit
some([false, false, true, 'foo'], x => {
    if (x === 'foo') throw Error('foo')
    return x
}) //-> true

every([true, true, 'foo'], x => {
    if (x === 'foo') throw Error('foo')
    return x
}) //-> Error: foo

// `cat` flattens collections--
// it only does this shallowly
// it will also die if it encounters a non-collection
seq([[1, 2], [3, 4], Cons.list(5, 6, 7, 8)], cat)
seq([Cons.list(1, 2), {a: 1, b: 2}], cat)

// it composes!
seq([[1, 2], [3, 4]], compose(
    cat,
    map(x => x +1)
)) //-> [2, 3, 4, 5]

// unique selects only unique elements
// it compares using ===, so reference types are all unique
seq([1, 2, 1, 3, 2, 4, 1], unique) //-> [1, 2, 3, 4]
seq([{foo: 'bar'}, {foo: 'bar'}], unique) //-> [{foo: 'bar'}, {foo: 'bar'}]

seq([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], compose(chunk(2), map(x => fold(x, (x, y) => x + y, 0))))
seq([1, 2, 3, 4, 5, 6, 7, 8, 9], chunk(3))