const p = require('espree')
const q = require('esquery')

const ast = p.parse('let ;', {ecmaVersion: 2021})
const node = q(ast, 'ObjectExpression')[0] //?

const special_forms = ["when", "ns", "recur"]

const is_special_form = (str) => special_forms.includes(str);

const create = (ctx) => ({
  VariableDeclarator (node) {
    if (node.id.type === 'Identifier' && is_special_form(node.id.name)) {
      ctx.report({node, message: `Cannot redefine special form \`${node.id.name}\``})
    }
  },
  "ObjectPattern Property" (node) {
    if (is_special_form(node.value.name)) {
      ctx.report({node, message: `Cannot redefine special form \`${node.value.name}\``})
    }
  },
  "ArrayPattern Identifier" (node) {
    if (is_special_form(node.name)) {
      ctx.report({node, message: `Cannot redefine special form \`${node.name}\``})
    }
  }
})

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Prohibits shadowing of Ludus special forms.',
      recommended: 'error'
    }
  }
}