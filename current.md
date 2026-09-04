# Current work: readability pass

Last updated 2026-09-04 (ch13-15 session).

## Status

Chapters 1 to 15 have had a density pass (ch01-03 in f3bcb2d, ch04-06 in d9491f2, ch07-09 in 051158c, ch10-12 in 1b2c1d6, ch13-15 in the commit after it). Chapters 16 onward have not. Next session: ch16, ch17, ch18.

## The problem

Several chapters are dense and hard to read. A previous pass (commit 3d63e77) fixed paragraph shape and left concept load per paragraph untouched. On ch01-03 the density came from four patterns, each with a mechanical fix.

1. **Naming before showing.** A term is listed or defined before the reader has run the R example. Fix: move the code block above the explanation, name the term after.
2. **Bold-lead-in bullet lists** of abstract features. Reference-manual shape, one unearned concept per bullet. Fix: prose, one idea per paragraph, example first.
3. **Digressions aimed at a different reader** (compiled vs interpreted, C aliasing, corporate history). Fix: collapsed callout so the content survives for readers who want it:

   ```
   ::: {.callout-note collapse="true"}
   ## Title
   ...
   :::
   ```

4. **Proper-noun and cross-ref stacking.** Four `@sec` refs in one paragraph, or a run of machine names and company names. Fix: keep names that carry the story, drop decoration, one cross-ref per paragraph.

## Procedure per chapter

1. Read the whole chapter. Mark every paragraph with more than one new concept or more than one cross-ref.
2. Apply the matching fix from the list above. Keep index entries (`\index{...}`); move them to where the term is now earned.
3. Check for stale back-references while there (ch03 referred to "the calculator in Chapter 1"; ch01 has Mr. Fold, no calculator).
4. Verify labels before adding a cross-ref: `grep -rhoE '\{#sec-[^}]*\}' chapters/ | sort -u`.
5. Render and scan:

   ```
   quarto render chapters/ch04-vectors.qmd --to html
   python /c/GillesC/dev/dotfiles/python/scan_ai.py chapters/ch04-vectors.qmd
   ```

   The scanner flags strings, not problems. Passives in narrative and functional lead-ins ("Don't worry about the details yet") stay. Act on: negative openers, "works differently" announcers, em-dashes, staccato runs.
6. Commit source plus `docs/` and `_freeze/` together.

## Guards

- Load the `author-voice` and `anti-ai-rewriting` skills before editing prose.
- Do not shorten for its own sake. ch01-03 lost about 380 words, all from digressions and decoration.
- Do not add captions, lead-ins, or bullet titles the chapter did not have.
- Ch01 sets the template for historical figures: situation first, name after the action.

## Notes from ch04-06

- Beta reduction is now named once, in ch05 `add_one(10)` (@sec-return-values). ch04 only says "substitution"; ch01-03 never name it.
- Bold lead-ins over code blocks (ch04 indexing, ch06 matrix ops) became prose lead-ins, code unchanged.
- Callouts added: ch04 monoid, sqrt-by-iteration, functor, Haskell/Rust `Maybe`; ch05 currying, factorial in lambda calculus, proof assistants; ch06 pairwise summation, interval arithmetic.
- ch06 storage section now opens with the `sprintf("%.20f", 0.1)` demonstration; IEEE 754 is named after it.

## Notes from ch07-09

- Chapter order matters for step 3: ch08 re-taught `0.1 + 0.2` and IEEE 754 storage and forward-referenced ch06 as if it came later. The double-storage section was removed; the binary-integer part moved into the full-adder callout, and comparisons back-reference @sec-floating-point-traps.
- Two factual fixes found while reading: ch08 said `if (c(TRUE, FALSE))` warns and uses the first element (it errors, and the rendered output already showed the error); ch09 said `sort()` is introsort (it is radix for numeric/integer/logical/factor vectors under 2^31, Shellsort otherwise, per `?sort`). Check prose against rendered output whenever a chunk has `error: true`.
- `object.size()` reports the expanded size of a compact `1:n`; `lobstr::obj_size()` reports 680 B. `as.numeric(1:n)` stays compact too; `sample()`, `rev()`, and `x + 0L` materialize.
- ch08 `sec-recursion` pointed at ch22; Church booleans are in ch05 `sec-recursion-preview`. ch08 "calculator from @sec-turing" is Mr. State.
- Callouts added: ch07 none new (two reworded); ch08 lambda connection for `if/else`, gates and half adder merged into one; ch09 sorting lower bound, amortized doubling, lambda-calculus halting proof, Kolmogorov complexity.
- Bold-lead-in complexity classes (ch09) became prose paragraphs, R example first, class named at the end.

## Notes from ch10-12

- Three factual fixes found by running the code against the prose: ch12 said `factor(c("male", "female", "female"))` stores `1, 2, 2` (it stores `2, 1, 1`; female is level 1); ch12 said lubridate's `ymd("2026-01-31") + months(1)` gives February 28 (it gives `NA`; `%m+%` gives February 28, and the section now shows both); ch11 said a tibble "refuses" `tbl$sp` (it warns and returns `NULL`). Run every claim about an output, not just chunks with `error: true`.
- Stale reference: ch11 closing said lists were taught in "Chapter 8". Lists are @sec-lists (ch10). Both literal "Chapter N" mentions in ch11 became @sec-lists.
- Bullet-to-prose: ch10 train-analogy accessors (code now precedes the picture), ch11 tibble differences, ch12 factor use cases, ch12 date classes, ch12 duration/period/interval (now demonstrated with `days(1)` vs `ddays(1)` across the 2026-03-28 Vienna DST change).
- Callouts added: ch11 relational model (Codd, SQL, pandas, Arrow moved out of the guarantee paragraph), ch11 column stores vs row stores; ch12 sum types (was main text). ch10's cons-cell callout absorbed the IBM 704 register fact.
- ch10 linked lists now build the structure first and name it after `str(ll)`; the @sec-stack-and-heap forward reference and the VECSXP/BLAS detail are gone from the main text.
- ch12 regex: the two `str_detect()` examples and `str_view()` now come before the building-block table.
- Code chunks added: ch11 `str(list(a = 1:5, b = 1:3))` and the failing `data.frame(a = 1:5, b = 1:3)`; ch12 `%m+%`, `days(1)`/`ddays(1)`, and the DST example. Adding a chunk before a figure renumbers `unnamed-chunk-N-1.png` in `_freeze/` and `docs/`; delete the orphaned old one.

## Notes from ch13-15

- Three factual fixes from running the code: ch14 said `distinct(penguins, species, island)` gives seven combinations (five); ch14 closing said Adelie average 3,706 g (3,701; the rendered output already showed 3701); ch14 Opinion said `summarise()` "silently" peels off the last grouping variable (dplyr 1.2.1 prints a "has regrouped the output" message, and the freeze output already contained it). The main text now points at that message when it first appears.
- Broken cross-ref: ch13 "the full treatment of database-backed dplyr is in @sec-databases" pointed at its own section. Now @sec-columnar-engines (ch28). Grep every `@sec-` in a chapter against the chapter's own labels; a self-reference renders fine and is invisible unless you click it.
- Show-before-name: ch14 now loads `palmerpenguins` and prints `penguins` before the five verbs are listed (the list is one prose sentence, no bullets); `group_by()` is shown as the fix for the one-row `summarise()` before it is named; ch15 names function composition after the `clean_and_summarise` code, and the `|>` section no longer names composition or @sec-church at all.
- Callouts added: ch13 "There is no CSV standard" (IBM/RFC 4180 history) and the pure-function callout moved from the top of the CSV section to after the `col_types` example; ch14 "Codd's algebra" (relational algebra, IMS, SQL/pandas/data.table), which back-references the ch11 relational-model callout via @sec-list-of-vectors; ch15 "Kleisli composition" (the `%>%` monad analogy).
- Bullet-to-prose: ch13 readr and readxl argument lists (code first, arguments named after); ch15 nesting/intermediates/overwriting and the five "when not to pipe" cases lost their bold lead-ins, code unchanged.
- McIlroy (ch15) is now situation first: the 1964 Bell Labs memo and the garden-hose line, then the Unix `|` nine years later, then the name.
- Cut: ch13 circular closer ("Which brings us back to where we started"), ch14 "This is actually surprising" and the "Compare the two calls" teacher-mode paragraph, ch15 "Pipes made them legible" mic drop and the chapter-as-destination closer.
- Word counts: ch13 2841 to 2850, ch14 2570 to 2458, ch15 2181 to 2078.

## Files for the next session

- `chapters/ch16-tidy-data.qmd`
- `chapters/ch17-visualization.qmd`
- `chapters/ch18-closures-and-scope.qmd`
