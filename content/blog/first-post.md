+++
title = "First Post"
date = 2025-03-08
description = "A test of my custom made zola theme"

[taxonomies]
tags = []

[extra]
math = true
+++

## Epigraphs

{% epigraph(author="Richard Feynman") %}
The first principle is that you must not fool yourself — and you are the easiest person to fool.
{% end %}

{% epigraph() %}
It is a capital mistake to theorize before one has data.
{% end %}

{% epigraph(author="Blaise Pascal", source="Lettres Provinciales") %}
I have made this longer than usual because I have not had time to make it shorter.
{% end %}

---

## Quotes

{% blockquote(author="Edward Tufte", source="The Visual Display of Quantitative Information") %}
Graphical excellence is the well-designed presentation of interesting data.
{% end %}

This is exactly what Orwell had in mind when he wrote:

{% blockquote(author="George Orwell", source="Politics and the English Language") %}
Never use a long word where a short one will do.
{% end %}

And that principle applies equally to code.

## Side notes and margin notes

This is the `simd` first post.{% sidenote(id="sn-1") %}You can use all your shortcodes here too.{% end %}

## Full-width

Normal code that does not overflow the text width.

```c++
int main(void)
{
  std::cout << "Hello, World\n";
}
```

Full width code that does overflow.

<div class="fullwidth">

  ```python
  # a wide block that needs more horizontal space
  result = some_very_long_function_name(argument_one, argument_two, argument_three)
  ```

</div>


## Alert environments


> [!NOTE]
> This is a note with some additional context.

> [!TIP]
> A helpful tip for the reader.

> [!IMPORTANT]
> Something the reader really should not miss.
> This is the `simd` first post.{% sidenote(id="sn-2") %}side note in alert/quote.{% end %}

> [!WARNING]
> A warning about potential pitfalls.

> [!CAUTION]
> A strong caution about destructive or irreversible actions.


## Math support

Various ways to write math:

$$
x^2
\frac{1}{x}
12\\,\rm{m}^2
$$

Inline math: {% math() %}\frac{1}{2}{% end %}

Display math:
{% dmath() %}
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
12\,\rm{m}^2
{% end %}

...

{% dmath() %}
x^2
\frac{1}{x}
12\,\rm{m}^2
{% end %}

...

<div class="math-display">\[\int_0^\infty...\]</div>
