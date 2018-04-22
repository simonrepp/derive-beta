# `data/plain`

> or just plaindata

## File extension proposals

- `.plain`
- `.dt` meaning data, analog to `.txt` meaning text

Rejected proposals appendix

- `.pd` - Already taken by *Pure Data* (open source media framework)

## Design principles

> the whole idea with ignoring whitespace at the begin, end, between different connected lines and between relevant tokens is:
> when you write on paper you don't care if something is "a little to the right, left, further down or whatever"
> as long as "words" or whatever you write on paper are clearly separated and graspable by their intent,
> everything is fine! So this is how plaindata should behave as well because this caters to all audiences

## Baseline profile (for all audiences)

```plain
> Comment

# Section
## Section
### Section

Key: Value

Key:
- Value
- Value

-- Key
Value
-- Key

```

## Extended profile (for technical audiences)

```plain
Key:
Attribute Key = Attribute Value
More Key = More Value

:: Any Key
: Value

:: Any Key
- Value
- Value

:: Any Key
Attribute Key = Attribute Value
Another Key = Another Value

> These "null" keys/values take on their visual appearance as their keys

--
==
##
::

```

## AST and wording considerations

The `Document` builds the top level structure, it is a `Section` without a key or parent.

```plain
> ...
```

A `Section` has a key and can have `Attributes`, `Lists`, `Collections`, and `Sections`.

```plain
# Key

> ...
```

An `Attribute` has a `Key` and a `Value`.

```plain
Key: Value

-- Key
Value
-- Key

:: Key
- Value
```

A `List` has a `Key` any number of `Values`.

```plain
Key: Value
Key: Value

-- Key
Value
-- Key

-- Key
Value
-- Key

Key:
- Value
- Value

:: Key
- Value
- Value
```

A `Collection` consists of any number of `Collection Attributes`.

```plain
Key:
Collection Attribute = Value

:: Key
Collection Attribute = Value
```

## General introduction snippets

```js
const plaindata = require('plaindata');

const document = plaindata.parse('Greeting: Hello world!');

const greeting = document.attribute('Greeting');
```

```plain
> Rules for comments: They start with > and contain whatever
Rules for keys: The may not start with - # > = : and can not contain :
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

document.attribute('The Number', { process: parseNumber });
  => 666
```

## Edge cases and special behaviour appendix

Chances are you won't notice any of this special behaviour as it occurs in the
background, because, well, it's been diligently thought out. But just in case
you do run into something or were wondering about how some ambiguous cases are
dealt with behind the scenes, I'll gladly explain.

1. Empty keys and values are ignored

  ```plain
  -- Shopping list
  -- Shopping list
  Shopping list:
  Shopping list:
  -
  -
  :: Shopping list
  -
  ```
  ```js
  document.attribute('Shopping list')
    => null

  document.list('Shopping list')
    => []
  ```

  You can explicitly request them though

  ```js
  document.list('Shopping List', { includeEmpty: true })
    => [ null, null, null, null, null ]
  ```

3. Ambiguity is resolved through usage in code

  ```plain
  Shopping List:
  -
  ```
  ```js
  document.attribute('Shopping List')
    => null

  document.list('Shopping List')
    => [ null ]
  ```

4. And enforced by user-friendly, built-in, localized errors.

  ```plain
  Shopping List:
  -
  -
  ```
  ```js
  document.list('Shopping List')
    => [ null, null ]

  document.attribute('Shopping List')
    => 'Error: "Shopping List" can only be a single value, not a list!'

  document = parse(input, { locale: 'de' })
  document.attribute('Einkaufsliste')
    => 'Fehler: "Einkaufsliste" darf nur ein einfacher Wert sein, aber keine Liste!'
  ```

5. Data can also be read out and interpreted sequentially

  ```plain
  Shopping List:
  Shopping List:
  :: Shopping List
  ```
  ```js
  document.sequential()
    => [{ key: 'Shopping List', value: null },
        { key: 'Shopping List', value: null },
        { key: 'Shopping List', value: null }]
  }
  ```