const create = (ctx) => ({
  Literal (node) {
    if (node.value === null) {
      ctx.report({node, message: 'Unexpected reserved word `null`.'})
    }
    if (node.value.regex) {
      ctx.report({node, message: 'Regular expressions are not supported in Ludus.'})
    } 
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Prohibits invalid literals.',
      recommended: 'error'
    }
  }
};