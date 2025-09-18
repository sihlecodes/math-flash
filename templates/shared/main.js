document.addEventListener('DOMContentLoaded', function() {
  renderMathInElement(document.body, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '\\[', right: '\\]', display: true},
      {left: '$', right: '$', display: false}
    ],
    macros: {
      // aliases
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\R': '\\mathbb{R}',
      '\\C': '\\mathbb{C}',
      '\\te': '\\exist',
      '\\fa': '\\forall',
      '\\inv': '^{-1}',

      // new operators
      '\\t': '\\enskip\\text{#1}\\enskip',
      '\\Re': '\\thinspace\\text{Re}\\thinspace #1',
      '\\Im': '\\thinspace\\text{Im}\\thinspace #1',
      '\\lcm': '\\text{lcm}',
      '\\equivm': '\\thinspace\\equiv{\\thinspace #1}\\pmod #2',
      '\\bigmod': '\\left|#1\\right|',
      '\\partiald': '\\frac{\\partial #1}{\\partial #2}',
      '\\partialdi': '\\partial #1/\\partial #2',
    }
  })
});
