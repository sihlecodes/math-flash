# Things To Do

## Ideas

~~* Add multiple file watch support~~
~~* Add multilevel list styles~~
* Add --format flag for pretty formatting html output
* swappable background images
  - Add encoding to PNGs nad JPEGs
* Add support for custom shared templates via `$shared`
* swappable template dir
~~* make viewable templates more composable for cases like `quiz.ejs`~~

## Nice to haves

* make collating more performant
  - add directory watching instead of single file watching

## Documentation updates

* How $shared works
  - checks user's `_shared` directory first
  - otherwise uses math-flash's `_shared` directory
  - for template searching
* document .ejs files are not exported

* Documentation in README.md
  - Add help of how to set up puppeteer dependencies on linux
    - libnss3
    - libnspr4
    - libasound2-dev
  - add help for new flags -F, -N, -I
  - add version flag to cli usage
  - add documentation for nested being parsed recursively
  - add documentation for yaml global properties
  - Add a tip for using * bolding at the start of a property in Documentation
  - Difference when `page` is a string instead of a number
  - Unnumbered list style
  - Bigger spaces with '\ ' when outside of math mode
  - Double line breaks with '\\' -> <code><br><br></code> when outside of math mode
  - & at the beginning of display mode aligns equations at the & symbol
  - Non-breaking spaces when outside of math mode (\~)
  - Templates view-all/last + quiz
  - Add --no-open documentation
  - Additional katex macros
  - document default no breaking spaces in katex
    * ! operator (which prevents non breaking)

* Update cli help strings

~~* Add {} around equations by default~~
~~* Add pre-processing for * bolding and _ italicizing ~~
~~* Try fix the bug that breaks live previewing~~
~~* Fix '\ ' processing~~
~~* Strip space after $$~~
~~* Add an unnumbered list style~~
~~* Add pre-processing for replacing spaces around inline equations with &ensp;~~
