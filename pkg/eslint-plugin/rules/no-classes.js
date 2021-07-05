const create = (ctx) => ({
  ClassDeclaration (node) {
    ctx.report({node, message: 'Unexpected reserved keyword `class`.'})
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Prohibits the use of classes.',
      recommended: 'error'
    }
  }
};