const q = require('esquery');

const test = new RuleTester({parserOptions: {ecmaVersion: 2021}});

const node_includes = (node, selector) => (q(node, selector).length > 0)

const recur_s = '[name="recur"]'

const is_looped = (node) => {
  if (node.parent.type !== 'CallExpression') return false;
  if (node.parent.arguments[0] !== node) return false;
  if (node.parent.callee.name !== 'loop') return false;
  return true;
}

let check_node = (ctx, node) => {
  switch(node.type) {
    case 'Identifier': {
      if(node_includes(node, recur_s)) {
        return ctx.report({node, message: '`recur` must be called as a function.'})
      }
      return
    }
    case 'CallExpression': {
      const arguments = node.arguments
      if (node_includes(arguments, recur_s)) {
        return ctx.report({node, message: '`recur` must be used in tail position.'})
      }
      if (node.parent.type !== 'ConditionalExpression') {
        return ctx.report({node, message: 'Unterminated recursion.'})
      }
      return
    }
    case 'ConditionalExpression': {
      const {test, consequent, alternate} = node
      if (node_includes(test, recur_s)) {
        return ctx.report({node, message: '`recur` must be used in tail position'})
      }
      check_node(ctx, consequent)
      return check_node(ctx, alternate)
    }
    case 'BlockStatement': {
      let body = node.body
      for (const statement of body) {
        if (statement.type === 'ReturnStatement') {
          return check_node(ctx, statement.argument)
        }
        if (node_includes(statement, recur_s)) {
          return ctx.report({node: statement, message: '`recur` may only be used in tail position'})
        }
      }
    }
  }
}

const create = (ctx) => ({
  '[name="recur"]' (node) {
    let parent = node.parent
    while(parent.type !== 'ArrowFunctionExpression') {
      if (parent == null) return ctx.report({node, message: '`recur` may only be used in `loop`ed functions.'}) 
      parent = parent.parent 
    }
    if(!is_looped(parent)) {
      return ctx.report({node, message: '`recur` may only be used in `loop`ed functions.'})
    }
    if (node_includes(parent, '[name="loop"]')) {
      return ctx.report({node, message: 'You may not nest `loop`ed function definitions.'})
    }
    const body = parent.body
    check_node(ctx, body)
  }
})

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Ensures `recur` is in tail position',
      recommended: 'error'
    }
  }
}
