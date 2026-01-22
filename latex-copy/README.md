# LaTeX Copy

A userscript that enables copying LaTeX code from rendered equations on web pages.

## Usage

- By default, the script does not run on any site. You need to add the sites where you want it to run in your userscript manager (e.g., Tampermonkey, Greasemonkey).
- Once enabled for a site, double click on a rendered LaTeX equation to copy the original LaTeX code to your clipboard.

## Supported Rendering Engines

- [KaTeX](https://katex.org/): Best supported.
- [MathJax](https://www.mathjax.org/)
    - V2 is supported.
    - V3 and V4 won't be supported, because they intercept double-click events for their own purposes.

Future support for other rendering engines may be added.

## Supported & Unsupported Sites

> [!NOTE]
> These lists are far from exhaustive. They are just some examples where the script has been tested.

These sites are known to work with the script:

- [KaTeX](https://katex.org/)
- [ChatGPT](https://chatgpt.com/)
- [Math Stack Exchange](https://math.stackexchange.com/)
- ...

And these sites are known not to work:

- [GitHub](https://github.com)
- ...

## FAQ

- `Container found for ${engine}, but it doesn't seem to provide LaTeX code.`
    - This message indicates that the script found a container element for the LaTeX equation, but it couldn't extract the code. This may happen if the rendering engine has changed its structure, or if the site disables annotations.
