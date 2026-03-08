# Thinking in R

A free, open-source book that teaches R from scratch and explains why the language works the way it does.

**[Read the book](https://gillescolling.com/functional-r/)**

## About

Most R books teach you *what* to type. This one also explains *why* it works.

R descends from the lambda calculus, through Lisp, Scheme, and S. That lineage explains why everything in R is a vector, why functions are values you can pass around, why `x * 2` multiplies an entire column without a loop, and why `filter(df, x > 3)` can read column names without quotes. Understanding the design makes everything else easier to learn.

No programming experience is assumed. By the end, you will have written real code, understood functional programming, and seen ideas that transfer to any language.

## Structure

The book is organized in five parts and 33 chapters:

- **Foundations** (ch. 1--9): computation models, vectors, functions, logic, algorithms
- **Working with data** (ch. 10--17): lists, data frames, strings, I/O, dplyr, tidy data, ggplot2
- **Thinking functionally** (ch. 18--23): closures, map/reduce, function factories, recursion, lazy evaluation
- **The type system** (ch. 24--27): S3/S7 objects, contracts, metaprogramming, building a DSL
- **Going further** (ch. 28--33): performance, R internals, C++/Rust/Python interop, packages, reproducibility

## Contributing

Found an error? [Open an issue](https://github.com/gcol33/functional-r/issues). Want to improve something? Pull requests are welcome.

## Building locally

The book is built with [Quarto](https://quarto.org/).

```bash
quarto render
quarto preview   # live reload
```

## License

Text: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
Code: [MIT](https://opensource.org/licenses/MIT)
