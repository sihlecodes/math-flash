renderMathInElement(document.body, {
  delimiters: [
    {left: "$$", right: "$$", display: true},
    {left: "\\[", right: "\\]", display: true},
    {left: "$", right: "$", display: false}
  ],
  macros: {
    "\\R": "\\mathbb{R}",
    "\\C": "\\mathbb{C}",
    "\\e": "\\exist",
    "\\fa": "\\forall",
  }
});
