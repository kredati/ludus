import * as Obj from './obj.js'
import * as Fn from './fn.js'

const module = Symbol.for('ludus/module')
const iterator = Symbol.for('ludus/iterator')

const value = Symbol.for('transducer/value')
const reduced = Symbol.for('transducer/reduced')

const init = Symbol.for('transducer/init')
const step = Symbol.for('transducer/step')
const result = Symbol.for('transducer/result')

const array_reducer = {
    [init]: (arr = []) => arr,
    [step]: (arr, el) => (arr.push(el), arr),
    [result]: x => x
}

const object_reducer = {
    [init]: (obj = {}) => obj,
    [step]: (obj, [k, v]) => {
        obj[k] = v
        return obj
    },
    [result]: x => x
}

export function* object_iterator (obj) {
    for (const key in obj) yield [key, obj[key]]
    const symbol_keys = Object.getOwnPropertySymbols(obj)
    for (const key of symbol_keys) yield [key, obj[key]]
}

const string_reducer = {
    [init]: (str = '') => str,
    [step]: (s, t) => s + t,
    [result]: x => x
}

Object.assign(Array, array_reducer)
Object.assign(Object, object_reducer)
Object.assign(String, string_reducer)

const is_iterable = x => 
    x != null && 
    typeof x === 'object' &&
    Symbol.iterator in x

const gen_proto = Reflect.getPrototypeOf(function*(){})

export const is_generator = f => 
    f != null && 
    typeof f === 'function' && 
    Reflect.getPrototypeOf(f) === gen_proto

export const generate = (fn, seed, done = () => false) => function* () {
    let state = seed
    while (!done(state)) {
        yield state
        state = fn(state)
    }
}

export const range = n => generate(x => x + 1, 0, x => x >= n)

const get_iterator = x => {
    if (is_iterable(x)) return x
    if (typeof x === 'string') return x
    if (is_generator(x)) return x()
    if (Obj.has(x, module)) return 
    if (Obj.is_object(x)) return object_iterator(x)
}

export const infer = x => {
    if (Array.isArray(x)) return Array

    if (Obj.has(x, module)) return x[module][iterator]

    switch (typeof x) {
    case 'string': return String
    case 'function': return Function
    case 'object': return Object
    }
}

const accumulator = x => ({
    [value]: x,
    [reduced]: false
})

const deref = acc => {
    acc[reduced] = true
    return acc[value]
}

const reducer = (fn, first) => ({
    [init]: x => x ? accumulator(x) : accumulator(first),
    [step]: (acc, x) => {
        acc[value] = fn(acc[value], x)
        return acc
    },
    [result]: deref
})

export const transduce = (iterable, xform, reducer, first) => {
    const xformer = xform(reducer)
    const iterator = get_iterator(iterable)

    let res = xformer[init](first)

    for (const element of iterator) {
        res = xformer[step](res, element)
        if (res[reduced]) break
    }

    return xformer[result](res)
}

export const id = xform => ({
    [init]: x => xform[init](x),
    [step]: (acc, x) => xform[step](acc, x),
    [result]: x => xform[result](x)
})

export const fold = (iterable, fn, first) => 
    transduce(iterable, id, reducer(fn, first))

const build = coll => ({
    [init]: x => accumulator(coll[init](x)),
    [step]: (acc, x) => {
        acc[value] = coll[step](acc[value], x)
        return acc
    },
    [result]: acc => coll[result](acc[value])
})

export const into = (iterable, collection, xform = id) =>
    transduce(iterable, xform, build(infer(collection)), collection)

export const seq = (iterable, xform = id) =>
    typeof iterable === 'function' ? 
        lazy(get_iterator(iterable), xform)() :
        transduce(iterable, xform, build(infer(iterable)))

export const lazy = (iterable, xform = id) => function* () {
    const iterator = get_iterator(iterable)[Symbol.iterator]()

    while (true) {
        const next = iterator.next()

        if (next.done) return

        const container = seq([next.value], xform)

        while (container.length) {
            yield container.shift()
        }
    }
}

export const xform = xform => iterable => seq(iterable, xform)

//////// transformers
export const xformer = (xform, xforms) => Object.assign(id(xform), xforms)

export const map = fn => xform => xformer(xform, 
    {[step]: (acc, x) => xform[step](acc, fn(x))})

export const filter = fn => xform => xformer(xform, 
    {[step]: (acc, x) => fn(x) ? xform[step](acc, x) : acc})

export const remove = fn => filter(Fn.not(fn))

export const keep = filter(x => x != null)

export const take = n => xform => {
    let count = 0

    return xformer(xform, {
        [step]: (acc, x) => {
            count += 1
            if (count >= n) acc[reduced] = true
            return xform[step](acc, x)
        }
    })
}

export const take_while = fn => xform => xformer(xform, {
    [step]: (acc, x) => {
        if (!fn(x)) {
            acc[reduced] = true
            return acc
        }
        return xform[step](acc, x)
    }
})

export const take_nth = n => xform => {
    let count = 0
    return xformer(xform, {
        [step]: (acc, x) => {
            count += 1
            if (count % n === 0) return xform[step](acc, x)
            return acc
        }
    })
}

export const drop = n => xform => {
    let count = 0
    return xformer(xform, {
        [step]: (acc, x) => {
            count += 1
            return count > n 
                ? xform[step](acc, x)
                : acc
        }
    })
}

export const drop_while = fn => xform => {
    let engaged = false
    return xformer(xform, {
        [step]: (acc, x) => {
            if (engaged) return xform[step](acc, x)
            if (!fn(x)) {
                engaged = true
                return xform[step](acc, x)
            }
            return acc
        }
    })
}

export const drop_nth = n => xform => {
    let count = 0
    return xformer(xform, {
        [step]: (acc, x) => {
            count += 1
            if (count % n === 0) return acc
            return xform[step](acc, x)
        }
    })
}

export const repeat = n => xform => xformer(xform, {
    [step]: (acc, x) => {
        // eslint-disable-next-line
        for (const _ of range(n)()) {
            acc = xform[step](acc, x)
        }
        return acc
    }
})

export const chunk = n => xform => {
    let chunked = []
    return xformer(xform, {
        [step]: (acc, x) => {
            chunked.push(x)
            if (chunked.length === n) {
                const to_add = chunked
                chunked = []
                return xform[step](acc, to_add)
            }
            return acc
        },
        [result]: x => {
            if (chunked.length === 0) {
                x.reduced = true
                return xform[result](x)
            }
            x.reduced = false
            return xform[result](xform[step](x, chunked))
        }
    })
}

const first = Symbol('first')

export const chunk_by = fn => xform => {
    let accumulator = []
    let last = first

    return xformer(xform, {
        [step]: (acc, x) => {
            const current = fn(x)
            if (current === last || last === first) {
                accumulator.push(x)
            }
            else {
                acc = xform[step](acc, accumulator)
                accumulator = [x]
            }
            last = current
            return acc
        },
        [result]: x => accumulator.length === 0 
            ? xform[result](x)
            : xform[result](xform[step](x, accumulator))
    })
}

export const interpose = separator => xform => {
    let started = false
    return xformer(xform, {
        [step]: (acc, x) => {
            if (started) return xform[step](xform[step](acc, separator), x)

            started = true
            return xform[step](acc, x)
        }
    })
}

export const cat = xform => xformer(xform, {
    [step]: (acc, x) => fold(x, xform[step], acc)})

export const flat = xform => xformer(xform, {
    [step]: (acc, x) => {
        if (!is_iterable(x)) return xform[step](acc, x)

        return fold(x, flat(xform)[step], acc)
    }
})

export const unique = xform => {
    const elements = new Set()
    return xformer(xform, {
        [step]: (acc, x) => {
            if (elements.has(x)) return acc
            elements.add(x)
            return xform[step](acc, x)
        }
    })
}

export const dedupe = xform => {
    let last = first
    return xformer(xform, {
        [step]: (acc, x) => {
            if (x === last) return acc
            last = x
            return xform[step](acc, x)
        }
    })
}

export const on_values = val_xform => xform => xformer(xform, {
    [step]: (acc, [k, v]) => {
        const res = transduce(
            [v], 
            val_xform,
            {
                [init]: () => accumulator(first),
                [step]: (acc, v) => {
                    acc[value] = v
                    return acc
                },
                [result]: deref
            }
        )
        if (res === first) return acc
        return xform[step](acc, [k, res])
    }
})

export const on_keys = key_xform => xform => xformer(xform, {
    [step]: (acc, [k, v]) => {
        const res = transduce(
            [k], 
            key_xform,
            {
                [init]: () => accumulator(first),
                [step]: (acc, v) => {
                    acc[value] = v
                    return acc
                },
                [result]: acc => acc[value]
            }
        )
        if (res === first) return acc
        return xform[step](acc, [res, v])
    }
})

export const keys = map(([k]) => k)

export const values = map(([,v]) => v)

//////// reducers
const any_reducer = fn => ({
    [init]: () => accumulator(false),
    [step]: (acc, x) => {
        if (fn(x)) {
            acc[value] = true
            acc[reduced] = true
            return acc
        }
        return acc
    },
    [result]: deref
})

export const any = (iter, fn) => transduce(iter, id, any_reducer(fn))

const all_reducer = fn => ({
    [init]: () => accumulator(true),
    [step]: (acc, x) => {
        if (!fn(x)) {
            acc[value] = false
            acc[reduced] = true
            return acc
        }
        return acc
    },
    [result]: deref
})

export const all = (iter, fn) => transduce(iter, id, all_reducer(fn))

export const none = (iter, fn) => all(iter, Fn.not(fn))