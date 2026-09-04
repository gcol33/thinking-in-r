# Current work: readability pass

Last updated 2026-09-04.

## Status

Chapters 1 to 3 have had a density pass (commit after 1140339). Chapters 4 onward have not. Next session: ch04, ch05, ch06.

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

## Files for the next session

- `chapters/ch04-vectors.qmd`
- `chapters/ch05-first-function.qmd`
- `chapters/ch06-numerical-computing.qmd`
