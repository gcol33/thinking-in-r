# Thinking in R

Learn R the way it was meant to be used.

## Concept

Most R books teach R as a statistics tool. You learn to load data, run a t-test, make a plot, and copy-paste until it works. This book teaches R as a **language**: one built on functions, composition, and mathematical thinking. It starts from scratch but never talks down. By the end, you don't just use R, you understand it.

The thesis: R is a functional programming language descended from Scheme. Everything in R is an expression. Every expression returns a value. Functions are values. Once you see this, everything clicks: vectorization, pipes, formulas, tidyverse, ggplot. They're not magic, they're consequences of the language's design.

## What makes this different

- **Starts from zero, ends at mastery.** Chapter 1 starts with lambda calculus. The final chapters cover metaprogramming and building packages. The whole journey in one book.
- **Teaches the "why" from day one.** You don't learn `<-` as "the assignment arrow." You learn that R evaluates expressions and binds results to names. The mental model is correct from the start, so nothing needs to be unlearned later.
- **Functions first.** Most books teach data types, then control flow, then eventually functions. This book puts functions at the center because R does.
- **Opinionated.** Takes positions. "Use this, not that, and here's why." Not a reference manual.
- **Real examples.** Uses `penguins` (base R 4.5+) throughout. Scientific computing, data analysis, simulation. Never iris/mtcars busywork.

## Target audience

- Complete beginners who want to learn R properly from the start
- Self-taught R users who got things working but don't understand why
- Scientists switching to R from Python, Julia, or MATLAB
- Programmers from other languages who want to understand R's paradigm, not just its syntax

## Outline

### Part I: Foundations

1. **Two models of computation** - lambda calculus vs Turing machines, Church's functions-first worldview
2. **R's family tree** - Church to Lisp to Scheme to S to R, what R inherited and what it invented
3. **Expressions and names** - the REPL, everything is an expression, assignment as name binding
4. **Vectors** - atomic vectors, types, coercion, vectorized operations, indexing, NA
5. **Your first function** - defining functions, arguments and defaults, return values
6. **Numerical computing** - floating point, catastrophic cancellation, matrix algebra
7. **Functions are values** - passing functions, anonymous functions, storing functions in lists
8. **Logic and control flow** - TRUE/FALSE, comparison, if/else as expressions, vectorized conditionals

### Part II: Working with data

9. **Complexity and algorithms** - big-O, why algorithm choice matters, searching and sorting
10. **Lists** - recursive structure, named access, nested data
11. **Data frames** - a list of equal-length vectors, creating/subsetting/modifying, tibbles
12. **Strings, factors, and dates** - stringr, forcats, lubridate, regex essentials
13. **Reading and writing data** - CSV, Excel, databases, file paths, encodings
14. **Data transformation** - dplyr verbs as relational algebra: filter, select, mutate, summarise, arrange
15. **Pipes and composition** - |> as function composition, building readable pipelines
16. **Tidy data** - what tidy means and why, pivot_longer/wider, joins as set operations
17. **Visualization** - ggplot2 as a grammar, aesthetics, geoms, layers, ggplot2 as lambda calculus

### Part III: Thinking functionally

18. **Closures and scope** - environments, lexical scoping, closures as portable state
19. **Iteration without loops** - Map/lapply, purrr::map, replacing for-loops with functionals
20. **Function factories** - functions returning functions, memoization, parameterized families
21. **Reduce and accumulate** - folding lists, building values step by step, monoids
22. **Recursion and fixed points** - recursive thinking, self-reference, fixed-point combinators
23. **Lazy evaluation** - promises, tidy evaluation, NSE trade-offs

### Part IV: The type system

24. **S3 and S7** - dispatch, how `print()` knows what to do, writing methods, S7 as the future
25. **Contracts and defensive code** - validating inputs, informative errors, failing loudly
26. **Metaprogramming** - expressions as data, code that writes code
27. **Building a DSL** - domain-specific languages in R, putting metaprogramming to use

### Part V: Going further

28. **Performance** - profiling, vectorization, memory, C/C++ backends, DuckDB
29. **R internals** - SEXP, environments under the hood, copy-on-modify, garbage collection
30. **R as mathematics** - Curry-Howard correspondence, programs as proofs, category theory
31. **Connecting to other languages** - C, C++, Python, Rust, Julia interop
32. **Building packages** - turning functions into reusable, testable, shareable libraries
33. **Reproducibility and workflow** - projects, renv, targets, Quarto

**Afterword: Where the ideas lead** - category theory in retrospect, homotopy type theory, the gap between code and proof

## Style

- Short chapters (10-15 pages)
- Every concept introduced with intuition first, formalism second
- "Opinion boxes" sprinkled throughout ("Stop using sapply." "T and F are not TRUE and FALSE." "Attach nothing, ever.")
- Exercises after each major section (R4DS pattern), not just at chapter end
- Interactive code blocks via Quarto Live (webR): readers run and modify examples in the browser
- Gradual difficulty curve: Parts I-IV are gentle, Parts V-VII reward re-reading

## Voice

Direct, slightly irreverent, never condescending. A physicist explaining things to a colleague over coffee, not a professor lecturing a classroom. Short sentences. Clear opinions. No hedging.

## Credibility angle

Physicist turned ecologist. Builds C-backed R packages (corrselect, hexify, couplr, vectra, spacc). Teaches R the way he wishes someone had taught him.

## Competitive landscape

| Book | Stars | Gap this fills |
|---|---|---|
| R for Data Science (R4DS) | 4.7k | Teaches tidyverse workflows, not the language itself |
| Advanced R | 2.3k | Reference for experts, not accessible to beginners |
| R Packages | 1.4k | Package development only |
| Geocomputation with R | 1.6k | Domain-specific (spatial) |
| **Thinking in R** | - | Beginner to advanced, language-first, opinionated |

The closest gap: there is no free book that takes you from zero to deep understanding of R as a language. Standalone, no prerequisites, no assumed reading.

## Future-proofing

80% of the book teaches frozen language design: expressions, functions, closures, S3 dispatch, vectorization. These haven't changed in 30 years and won't change in the next 10. Volatile content (tooling, packages, ecosystem) is isolated in standalone chapters (13, 17, 28, 32, 33) that can be updated independently. S7 is covered alongside S3 as the designated successor. DuckDB, Arrow, and columnar engines appear in the performance chapter as the direction data tooling is heading, not as required knowledge.

## Format

Free online book (Quarto), hosted on GitHub Pages. CC-BY-SA license. Interactive code via Quarto Live (webR).

## Repository

https://github.com/gcol33/thinking-in-r (to be created)
