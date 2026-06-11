# Coding Conventions

- Prefer arrow function and method
- Prefer not to use nullish coalescing

# Formatting Rules

## Language

- Always write code and comment in English.
- You can response in chat using user prompt language.

## Characters

Use only ASCII (0x00-0x7F). Never use Unicode characters outside this range.

Banned examples:

| Category | Banned characters                |
| -------- | -------------------------------- |
| Dashes   | en dash, em dash, horizontal bar |
| Arrows   | any unicode arrows               |
| Quotes   | smart quotes, curly apostrophes  |
| Bullets  | bullet, triangle, diamond        |
| Math     | multiplication, division, minus  |
| Emoji    | all emoji without exception      |
| Misc     | ellipsis, checkmark, copyright   |

Use instead:

- Dashes: plain hyphen-minus (-)
- Arrows: -> or <- or => or <= (two ASCII chars)
- Quotes: straight double quotes (") or straight single quotes (')
- Bullets: plain hyphen (-) or asterisk (\*) or plus (+)
- Math: use plain ASCII operators (\*, /, -)
- Ellipsis: two plain periods (..)
- Copyright: (c)

## Formatting

- Use plain Markdown only: headings (#), bold (\*_), italic (_), code fences (```), tables, blockquotes (>).
- No decorative Unicode borders, box-drawing characters, or special symbols.
- Code blocks must use ASCII-only content unless quoting external source verbatim.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->
