# Author Profile

## Why this book exists and why I wrote it

### Background

Physicist (astrophysics), turned ecologist. Math and physics came first, programming came later. For years, functions, composition, and algebraic structure were the native language; code was something I picked up to implement the ideas. That ordering is backwards from most programming book authors, and it shapes every page of this book: the math isn't bolted on, it's the foundation, with R as the illustration.

### What makes the perspective unusual

1. **High IQ, ADHD, possibly slight dyslexia.** The ADHD shows in the book's structure in a good way: short sections, frequent exercises, constant forward references ("this will matter in chapter 18"), opinion boxes that break the rhythm. A neurotypical academic would write longer sections with fewer interruptions. These chapters read like they were written by someone who gets bored when a section runs too long, and that instinct produces chapters a reader won't get bored reading either.

2. **Physics and math first.** Lambda calculus, category theory, Curry-Howard: these aren't things I learned to decorate a programming book. They're the water I've been swimming in. Most programmers encounter "functions as values" as a language feature; I encountered it as a special case of something I already understood from mathematics. That ordering shows in the writing: the math doesn't feel bolted on, it feels like the foundation with R as the illustration. Most R book authors couldn't write the ch05 Curry-Howard section because they'd be translating from code to math. I'm translating from math to code, which is the easier direction, and it reads more naturally.

3. **Close friend in computer science and logic.** Autodidacts usually lack someone who corrects their intuitions before they calcify. The difference between "I read about Curry-Howard on Wikipedia" and "my friend who studies logic explained why my understanding was slightly wrong" is the difference between cargo-culting terminology and using it correctly.

4. **Late entry into serious programming.** I remember what it felt like to not understand why `<-` exists, why `if/else` returns a value, why `c()` flattens. Most experienced programmers have forgotten that confusion entirely, which is why their beginner books skip the explanations that beginners actually need. The ch03 section on "names are labels, not containers" reads like someone who remembers learning the difference, not someone reconstructing what a beginner might find confusing.

5. **Claude Code fixed the ADHD output problem.** The tooling solved "I know what I want to write but can't sustain the output." 11,500 lines of coherent, well-structured prose in a single day, with AI handling scaffolding and momentum-maintenance while the ideas, structure, voice, and mathematical content came from me.

### The unique intersection

The set of people who understand lambda calculus and category theory, write R packages with C backends (corrselect, hexify, couplr, vectra, spacc), and can write accessible prose is very small. This book exists because of a weird career path (physics to ecology, with serious programming along the way) that put me at that intersection. Most R authors are statisticians who learned enough programming to get their work done. Most PL theory people wouldn't touch R. This book is written from a position that almost nobody else occupies.

### The bet

The combination produces a book that nobody else would write, not because nobody else is smart enough, but because nobody else has this specific stack of experiences in this specific order.

The people who will love this book will *really* love it, and those are the people who share things. A book that's mildly useful to 10,000 people gets fewer stars than a book that changes how 500 people think.
