+++
title = "X86-64 Assembly on ARM64 Mac"
description = "Do you fancy X64 assembly on ARM64?"
draft = false
date = "2025-05-02"

[taxonomies]
tags = ["x86-64", "c"]

[extra]
math = false
+++

If you're looking for a way to code and execute x86-64 programs on ARM64 macs, this tutorial is for you.
Through [Rosetta 2](https://support.apple.com/en-us/102527), it is possible to compile and link C and x86-64  assembly programs into x86-64 binary and run it as if it were an ARM64 binary.{% sidenote(id="sn-1") %}It even <a href="https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment#Learn-what-Rosetta-cant-translate">translates</a> AVX and AVX2 instruction, but not AVX512.{% end %}
Here, I'll demonstrate how to write assembly code and call it from a C code.

---

The entire process is really simple.

Write your assembly code in a `.s` file.
Within it expose{% sidenote(id="sn-2") %}
By <em>exposing</em> or marking it as <em>global</em>, I mean making it visible to the linker across translation units.
{% end %} a symbol that you later on want to call in a C file.

```asm
  .text
  .globl _my_func
_my_func:
   ...
```

In this particular example, we made the `_my_func` symbol visible to the linker.

Then, to compile the C code, before even linking it against the assembly code, we declare the corresponding function with leading underscore removed.<!---->
{% marginnote(id="mn-1") %} Note the exposed symbol <code>_add_arrays</code>, which matches a C function with name <code>add_arrays</code>. This convention is part of MacOS's x86-64 ABI.{% end %}
{% marginnote(id="mn-2") %}
Note also that you don't have to specify the <code>extern</code> keyword before the function prototype since functions in C have external linkage by default.
However, for readability's sake, I like to keep it there to indicate the function is defined in an assembly file.
{% end %}

```c
// ~~~

extern <return_type> my_func(<params>...);

// ~~~

int main(void)
{...}
```

Finally, we compile the whole thing by passing both C and assembly files to the compiler as well as the `-target x86_64-apple-macos` flag.

```console
$ cc -target x86_64-apple-macos main.c my_func.s
```

> [!NOTE]
>
> C Compilers are able to do cross-compilation and produce binaries that target a specific architecture and ABI.
> In this case, by passing this flag, we essentially tell it to
>
> - assemble into x86-64 instructions
> - an in doing so use Mac's x86-64 ABI and Mach-o binary file format.

## Example: Adding Integer Arrays with SIMD Operations

To make this a bit concrete, let's go through a simple example of adding two arrays using [SSE instructions](https://www.google.com/search?q=sse+instructions&oq=sse+instructions&sourceid=chrome&ie=UTF-8).

Here's the assembly code.

```asm
# file: add_simd.s

.text
.globl _add_arrays

# void add_arrays(
#     const int *a,   rdi
#     const int *b,   rsi
#     int *res,       rdx
#     int n           rcx
# )

_add_arrays:
    xorq %r8, %r8

.loop:
    cmpq %rcx, %r8
    jge .done

    # Load four integers from `a` (%rdi)
    movdqu (%rdi,%r8,4), %xmm0

    # Load four integers from `b` (%rsi)
    movdqu (%rsi,%r8,4), %xmm1

    # Add four integers in parallel
    paddd %xmm1, %xmm0

    # Store the result
    movdqu %xmm0, (%rdx,%r8,4)

    addq $4, %r8
    jmp .loop

.done:
    ret
```

> [!CAUTION]
> Here, we're assuming `n` is a multiple of 4.
> Ideally, we would need to handle remaining elements if `n` weren't divisible by 4.

In the C code, we declare the `add_arrays` function at the top of the file.

```c
// file: main.c

#include <stdio.h>
#include <stdint.h>

extern void add_arrays(const int *a, const int *b, int *res, int n);

int main(void)
{
    int a[] = {1, 2, 3, 4, 5, 6, 7, 8};
    int b[] = {10, 20, 30, 40, 50, 60, 70, 80};
    int res[8] = {0};

    add_arrays(a, b, res, 8);

    for (int i = 0; i < 8; i++) {
        printf("%d ", res[i]);
    }

    printf("\n");
}
```

Now, to compile and check the file format

```console
$ clang -target x86_64-apple-macos main.c add_simd.s
$ file a.out
a.out: Mach-O 64-bit executable x86_64
```

Running it should gives us:

```console
$ ./a.out
11 22 33 44 55 66 77 88
```
