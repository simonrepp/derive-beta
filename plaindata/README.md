# `data/plain`

> plaindata is the new plaintext

File extension brainstorming:
- `.plain`
- Alternative `.pd` taken by PD (open source media framework) ?
- `.dt` as in (plain) data, analog to `.txt` as in (plain) text

> the whole idea with ignoring whitespace at the begin, end, between different connected lines and between relevant tokens is:
> when you write on paper you don't care if something is "a little to the right, left, further down or whatever"
> as long as "words" or whatever you write on paper are clearly separated and graspable by their intent,
> everything is fine! So this is how plain data should behave as well because everything else is programmerthink

```js
const plaindata = require('plaindata');

const document = plaindata.parse('Greeting: Hello world!');

const greeting = document.value('Greeting');
```

```plain
> Rules for comments: They start with > and contain whatever
Rules for keys: The may not start with - # > and can not contain :
Rules for values: They can contain whatever

Key: Value
Another key:
- Another value
- And yet another one
-- Also a key
- More values
- And more value
```

```js
const plaindata = require('plaindata');

const document = plaindata.parse('The Number: 666');

const parseNumber = ({ key, value }) => {
  if(value === '666') {
    return 666;
  } else {
    throw `"${key}" is anything but the right number.`;
  }
};

document.value('The Number', { process: parseNumber });
  => 666
```

## Edge cases and special behaviour appendix

Chances are you won't notice any of this special behaviour as it occurs in the
background, because, well, it's been diligently thought out. But just in case
you do run into something or were wondering about how some ambiguous cases are
dealt with behind the scenes, I'll gladly explain.

1. Empty keys and values are ignored

  ```plain
  --- Shopping list
  --- Shopping list
  Shopping list:
  Shopping list:
  -
  -
  -- Shopping list
  -
  ```
  ```js
  document.value('Shopping list')
    => null

  document.values('Shopping list')
    => []
  ```

  You can explicitly request them though

  ```js
  document.values('Shopping List', { includeEmpty: true })
    => [ null, null, null, null, null ]
  ```

3. Ambiguity is resolved through usage in code

  ```plain
  Shopping List:
  -
  ```
  ```js
  document.value('Shopping List')
    => null

  document.values('Shopping List')
    => [ null ]
  ```

4. And enforced by user-friendly, built-in, localized errors.

  ```plain
  Shopping List:
  -
  -
  ```
  ```js
  document.values('Shopping List')
    => [ null, null ]

  document.value('Shopping List')
    => 'Error: "Shopping List" can only be a single value, not a list!'

  document = parse(input, { locale: 'de' })
  document.value('Einkaufsliste')
    => 'Fehler: "Einkaufsliste" darf nur ein einfacher Wert sein, aber keine Liste!'
  ```

5. Data can also be read out and interpreted sequentially

  ```plain
  Shopping List:
  Shopping List:
  -- Shopping List
  ```
  ```js
  document.sequential()
    => [{ key: 'Shopping List', value: null },
        { key: 'Shopping List', value: null },
        { key: 'Shopping List', value: null }]
  }
  ```
