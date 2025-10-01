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
      '\\tbf': '\\textbf',
      '\\tit': '\\textit',
      '\\subg': '\\le',
      '\\nsubg': '\\trianglelefteq',

      // new operators
      '\\abs': '\\left|#1\\right|',
      '\\norm': '\\left\\|#1\\right\\|',
      '\\ang': '\\left\\langle#1\\right\\rangle',
      '\\t': '\\enskip\\text{#1}\\enskip',
      '\\Re': '\\thinspace\\text{Re}\\thinspace',
      '\\Im': '\\thinspace\\text{Im}\\thinspace',
      '\\Arg': '\\text{Arg}\\thinspace',
      '\\Log': '\\text{Log}\\thinspace',
      '\\lcm': '\\text{lcm}',
      '\\equivm': '\\thinspace\\equiv{\\thinspace #1}\\pmod {#2}',
      '\\bigmod': '\\left|#1\\right|',
      '\\partiald': '\\frac{\\partial #1}{\\partial #2}',
      '\\partialdi': '\\partial #1/\\partial #2',
      '\\dom': '\\text{dom}',
      '\\charc': '\\text{char}',
      '\\res': '\\text{res}',
      '\\ord': '\\text{ord}',
      '\\d': '\\thinspace d#1'
    }
  })

  const cards = Array.from(document.querySelectorAll('.card'))

  const areCardsSameSize = cards.reduce((acc, c, _, a) =>
    acc && (a[0].clientWidth === c.clientWidth)
        && (a[0].clientHeight === c.clientHeight), true);

  if (!areCardsSameSize) {
    const warning = document.createElement('div')
    warning.classList.add('warning');
    warning.innerHTML = '<b>WARNING:</b> Flash cards are not the same size.';

    document.body.appendChild(warning);
  }
});
