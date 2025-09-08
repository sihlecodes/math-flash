<img src="images/banner.svg" alt="Banner image">

# Math Flash⚡
A cli tool for creating custom printable flash cards. Math flash comes with a host features such changing the number of flash cards printed on a single page, changing page sizes, previewing flash cards in realtime and more. 🙃 

## Getting Started
### Installation
Installing math-flash is as simple as copying and pasting this to your terminal. Assuming you have [node](https://nodejs.org/en/) installed on your system.
```bash
npm install -g math-flash
```
Alternatively, you can install the package from source as follows:
```bash
git clone https://github.com/sihlecodes/math-flash
cd math-flash
npm install
npm install -g .
```
### The Basics
To get started; create a new folder. Then using the following command you can generate a new flash card file with an example of the definition format.
```
math-flash -g chapter01.yaml
```
Using the following command you can start a live preview session. This will open http://localhost:3000 in your browser and allows you to view what your flash cards will look like whenever you make changes to `chapter01.yaml` (or whatever you called your flash card .yaml file).
```
math-flash --view chapter01.yaml
```
Finally you can export your flash cards to PDF format, ready for printing. This will create a folder called `./output/` which has a number of files / folders namely `chapter01.pdf` and `chapter01.html` (along with `./shared/`) which is used to generate `chapter01.pdf`. 
```
math-flash chapter01.yaml
```
When printing ensure that you print with the option: "Flip on long side"

## Commandline Usage
`Note`: no matter what options you use, you must specify `${FLASH_CARD_FILE}` which is just a YAML file containing flash card definitions.
### Generation flags
`Note`: Cannot be used in combination with each other.
* `--html-only` don't generate pdf.
* `--pdf-only` don't save html files used for pdf generation.
* `-g`, `--generate` create a new flash card file using the default template.

### Export options & flags
* `-f`, `--format` (defaults to `A4`) pdf output format. (note: ignored if --html-only is used along with this option.)`
* `-l`, `--landscape` export pdf in landscape. 
* `-m`, `--margins` (defaults to `5mm`) specify margins in a similar fashion to css margins but dimensions should be comma separated. (i.e. `10px,5mm` corresponds to 10px top & bottom margins, 5mm left & right margins). Alternatively you can specify all 4 margins, comma separated of course :D.
* `-c`, `--columns` (defaults to `2`)
* `-r`, `--rows` (defaults to `4`)
* `-o`, `--output-directory` (defaults to `./output/`)
* `-n`, `--output-name` (defaults to `${FLASH_CARD_FILE}`) name of the resulting pdf and html files
* `--font-size`, (defaults to `9pt`) specified in css units`

### Live preview options & flags
* `-v`, `--view` launch a live preview in the browser
* `-p`, `--port` (defaults to `3000`)
* `--check-interval`, (defaults to `100`) interval for checking flash file changes (in milliseconds)

## Flash Card Files
A flash card file is simply a .yaml file with the following basic definition properties.

### Flash card definition properties
Properties displayed on the front side of the card:
* `heading` a heading displayed on every card.
* `term` should be either a question or simple statement that will be explained further by `description`.
* `alias` should be an alias of `term`.
* `page` should be the page number where `term` or `description` can be found.

Properties displayed on the back side of the card:
* `description` should be used to explain `term` in detail.
* `list` a shorthand for generating an html ordered list. Should be specified in a yaml list format. (i.e. separate lines that start with a hyphen or have the values comma separated inside `[]`). 
* `listStyle` changes the numbering style of `list` (current styles include `decimal`, `roman`, `alpha`, and `bracket` which is used in combination with one of the others to add a `)` instead of `.` after numbering).
* `footer` text that goes right after the contents of `list`.

### Tips for Editing Flash Card Files
Inside flash card files, you can:
* add multiple flash card definitions in the same file by separating them using `---`.
* embed html tags inside properties.
* embed katex inside properties using `$(insert katex code)$` (for inline katex code that is meant to be inline with other text) and `$$(insert katex code)$$` (which is for `display mode` katex which allows you to write larger equations e.g. when writing sums or integrals).
 
### Example Flash Card File
```yaml
heading: Abstract Algebra

---
term: Characterization of *cyclic groups generated* by an element $a\in G$ in terms of subgroups.
alias: Theorem 3.1
description: |
   Let $G$ be a group and $a\in G$. Then the set $$<a>=\{a^k:k\in\Z}$$ is a subgroup of $G$. Futhermore, $<a>$ is the smallest subgroup of $G$ that contains $a$.
page: 53
---
term: Conditions for $H\sub G$ to be a <b>subgroup</b> (3-step).
alias: Proposition 2.9
page: 124
description: |
  A subset $H$ of $G$ is a subgroup if and only if it satisfies the following conditions.
listStyle: roman bracket
list:
  - The identity $e$ of $G$ is in $H$.
  - If $h_1,h_2\in H$, then $h_1h_2\in H$
  - If $h \in H$, then $h^{-1}\in H$
footer:
  Footer text goes here
```

## License

Licensed under the MIT License. See [LICENSE](./LICENSE). 
