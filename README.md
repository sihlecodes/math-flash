# Math Flash 🧠
A cli tool for creating custom printable flash cards.

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Configuration](#configuration)
5. [Licence](#license)

## Getting Started
### Installation
Installing math-flash is as simple as copying and pasting this to your terminal. Assuming you have [node](https://nodejs.org/en/) installed on your system.
```bash
npm install -g math-flash
```
### The Basics
Create a new folder and navigate to it.
```
mkdir flashCards
cd flashCards
```
Using the following command you generate a new flash card file. You can then open up this file in your editor of choice.
```
math-flash -g chapter01.yaml
```
Then open 
```
math-flash --view chapter01.yaml
```
Finally you can export your flash cards to PDF format ready for printing. This will generate a few files under
```
math-flash chapter01.yaml
```

### Creating Flash Cards
A flash card file is simply a .yaml file with the following basic attributes. You can embed katex using `$(insert katex code)$` (for inline katex code that is meant to be inline with other text) and `$$(insert katex code)$$` (which is for display mode katex which allows you to write larger equations).
```yaml
heading: Abstract Algebra

---
term: Conditions for $H\sub G$ to be a <b>subgroup</b> (3-step).
name: Proposition 2.9
page: 124
description: |
  A subset $H$ of $G$ is a subgroup if and only if it satisfies the following conditions.
listStyle: decimal
list:
  - The identity $e$ of $G$ is in $H$.
  - If $h_1,h_2\in H$, then $h_1h_2\in H$
  - If $h \in H$, then $h^{-1}\in H$
footer:
  Footer text goes here
```

## License

MIT
