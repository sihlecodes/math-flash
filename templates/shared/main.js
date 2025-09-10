document.addEventListener('DOMContentLoaded', function() {
  renderMathInElement(document.body, {
    delimiters: [
      {left: "$$", right: "$$", display: true},
      {left: "\\[", right: "\\]", display: true},
      {left: "$", right: "$", display: false}
    ],
    macros: {
      "\\N": "\\mathbb{N}",
      "\\Z": "\\mathbb{Z}",
      "\\Q": "\\mathbb{Q}",
      "\\R": "\\mathbb{R}",
      "\\C": "\\mathbb{C}",
      "\\te": "\\exist",
      "\\fa": "\\forall",
      "\\t": "\\enskip\\text{#1}\\enskip",
      "\\Re": "\\thinspace\\text{Re}\\thinspace #1",
      "\\Im": "\\thinspace\\text{Im}\\thinspace #1",
    }
  })
});
