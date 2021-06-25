//////////////////// Vectors
// 2D to start, at least
// Vectors will be crucial to Kredati, and will probably move there eventually
// For now this is an exercise in writing more Ludus code to get a feel for the language I created

// TODO: figure out how to handle floating point imprecision
// TODO: make rotate faster
// TODO: consider abstracting functions for 3- (or n-dimensional) vectors
// TODO: research other vector math to add

import '../prelude/prelude.js';

let vect_t = type({name: 'Vect'});

let vect = fn({
  name: 'vect',
  doc: 'Creates a vector',
  pre: args([is_num, is_num]),
  body: (x, y) => create(vect_t, {x, y})
});

let add = fn({
  name: 'add',
  doc: 'Adds vectors. With one argument, partially applies itself. Adds any number of vectors.',
  pre: args([is(vect_t)]),
  body: [
  (v) => partial(add, v),
  (v1, v2) => {
    let x1 = get('x', v1);
    let y1 = get('y', v1);
    let x2 = get('x', v2);
    let y2 = get('y', v2);
    return vect(Num.add(x1, x2), Num.add(y1, y2));
  },
  (v1, v2, v3, ...more) => reduce(add, [v1, v2, v3, ...more])
  ]
});

let sub = fn({
  name: 'sub',
  doc: 'Subtracts vectors. With one argument, partially applies itself. With three or more arguments, keeps subtracting vectors.',
  pre: args([is(vect_t)]),
  body: [
  (v1) => fn(`sub<partial(${show(v)})>`, (v2) => sub(v2, v1)),
  (v1, v2) => vect(
    Num.sub(get('x', v1), get('x', v2)), 
    Num.sub(get('y', v1), get('y', v2))),
  (v1, v2, v3, ...vs) => vect(
    Num.sub(...map(get('x'), [v1, v2, v3, ...vs])),
    Num.sub(...map(get('y'), [v1, v2, v3, ...vs]))
  )
  ]
});

let mult = fn({
  name: 'mult',
  doc: 'Multiplies a vector by a scalar.',
  pre: args([is_num], [is_num, is(vect_t)]),
  body: [
  (n) => partial(mult, n),
  (n, {x, y}) => vect(Num.mult(n, x), Num.mult(n, y))
  ]
});

let dot = fn({
  name: 'dot',
  doc: 'Calculates the dot product of vectors.',
  pre: args([is(vect_t)]),
  body: [
    (v) => partial(dot, v),
    (v1, v2) => Num.add(
      Num.mult(get('x', v1), get('x', v2)),
      Num.mult(get('y', v1), get('y', v2))),
    (v1, v2, v3, ...vs) => Num.add(
      Num.mult(...map(get('x'), [v1, v2, v3, ...vs])),
      Num.mult(...map(get('y'), [v1, v2, v3, ...vs])))
  ]
});

let length = fn({
  name: 'length',
  doc: 'Returns the length of a vector.',
  pre: args([is(vect_t)]),
  body: ({x, y}) => hypot(x, y)
});

let angle_of = fn({
  name: 'angle_of',
  doc: 'Calculates the angle of a vector, in radians.',
  pre: args([is(vect_t)]),
  body: ({x, y}) => atan(y, x)
});

let from_angle = fn({
  name: 'from_angle',
  doc: 'Returns a unit vector described by the angle in radians.',
  pre: args([is_num]),
  body: (angle) => vect(cos(angle), sin(angle))
});

let norm = fn({
  name: 'norm',
  doc: 'Normalizes a vector: returns a unit vector at the same angle.',
  pre: args([is(vect_t)]),
  body: (v) => from_angle(angle_of(v))
});

let rotate = fn({
  name: 'rotate',
  doc: 'Rotates a vector by an angle, preserving the length.',
  pre: args([is_num], [is_num, is(vect_t)]),
  body: [
  (angle) => partial(rotate, angle),
  (angle, v) => {
    let v_len = length(v);
    let new_angle = Num.add(angle, angle_of(v));
    let rotated_unit = from_angle(new_angle);
    return mult(v_len, rotated_unit);
  }
  ]
});

let gt = fn({
  name: 'gt',
  doc: 'Compares vectors based on length. Returns true if the arguments are in continually decreasing order. With one argument returns itself partially applied.',
  pre: args([is(vect_t)]),
  body: [
  (v1) => fn(`gt<partial(${show(v)})>`, (v2) => gt(v2, v1)),
  (v1, v2) => Num.gt(sum_of_squares(get('x', v1), get('y', v1)), 
    sum_of_squares(get('x', v2), get('y', v2))),
  (v1, v2, v3, ...vs) => Num.gt(...map(({x, y}) => sum_of_squares(x, y), [v1, v2, v3, ...vs]))
  ]
});

let gte = fn({
  name: 'gte',
  doc: 'Compares vectors based on length. Returns true if the arguments are in decreasing or flat order. With one argument returns itself partially applied.',
  pre: args([is(vect_t)]),
  body: [
  (v1) => fn(`gte<partial(${show(v)})>`, (v2) => gt(v2, v1)),
  (v1, v2) => Num.gte(sum_of_squares(get('x', v1), get('y', v1)), 
    sum_of_squares(get('x', v2), get('y', v2))),
  (v1, v2, v3, ...vs) => Num.gte(...map(({x, y}) => sum_of_squares(x, y), [v1, v2, v3, ...vs]))
  ]
});

let lt = fn({
  name: 'lt',
  doc: 'Compares vectors based on length. Returns true if the arguments are in continually increasing order. With one argument returns itself partially applied.',
  pre: args([is(vect_t)]),
  body: [
  (v1) => fn(`lt<partial(${show(v)})>`, (v2) => gt(v2, v1)),
  (v1, v2) => Num.lt(sum_of_squares(get('x', v1), get('y', v1)), 
    sum_of_squares(get('x', v2), get('y', v2))),
  (v1, v2, v3, ...vs) => Num.lt(...map(({x, y}) => sum_of_squares(x, y), [v1, v2, v3, ...vs]))
  ]
});

let lte = fn({
  name: 'lte',
  doc: 'Compares vectors based on length. Returns true if the arguments are in continually increasing order. With one argument returns itself partially applied.',
  pre: args([is(vect_t)]),
  body: [
  (v1) => fn(`lte<partial(${show(v)})>`, (v2) => gt(v2, v1)),
  (v1, v2) => Num.lte(
    sum_of_squares(get('x', v1), get('y', v1)), 
    sum_of_squares(get('x', v2), get('y', v2))),
  (v1, v2, v3, ...vs) => 
    Num.lte(...map(({x, y}) => sum_of_squares(x, y), [v1, v2, v3, ...vs]))
  ]
});

let random = fn({
  name: 'random',
  doc: 'With zero arguments, returns a random unit vector. With one argument, a number, returns a random vector of that length.',
  pre: args([], [is_num]),
  body: [
    () => from_angle(Num.random(0, Num.mult(2, pi))),
    (n) => mult(n, random())
  ]
});

export default ns({
  type: vect_t,
  members: {
    vect, add, mult, dot, length, angle_of, from_angle, norm,
    rotate, gt, gte, lt, lte, random
  }
});
