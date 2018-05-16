## Baseline profile (for all audiences)

```eno
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

```eno
Key:
Attribute Key = Attribute Value
More Key = More Value

:: Any Key
- Value

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

```eno
> ...
```

A `Section` has a key and can have `Attributes`, `Lists`, `Maps`, and `Sections`.

```eno
# Key

> ...
```

An `Attribute` has a `Key` and a `Value`.

```eno
Key: Value

-- Key
Value
-- Key

:: Key
- Value
```

A `List` has a `Key` any number of `Values`.

```eno
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

A `Map` consists of any number of `Map Attributes`.

```eno
Key:
Map Attribute = Value

:: Key
Map Attribute = Value
```

## General introduction snippets

```js
const eno = require('eno');

const document = eno.parse('Greeting: Hello world!');

const greeting = doc.field('Greeting');
```

```eno
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
const eno = require('eno');

const document = eno.parse('The Number: 666');

const parseNumber = ({ key, value }) => {
  if(value === '666') {
    return 666;
  } else {
    throw `"${key}" is anything but the right number.`;
  }
};

doc.field('The Number', { process: parseNumber });
  => 666
```

## Edge cases and special behaviour appendix

Chances are you won't notice any of this special behaviour as it occurs in the
background, because, well, it's been diligently thought out. But just in case
you do run into something or were wondering about how some ambiguous cases are
dealt with behind the scenes, I'll gladly explain.

1. Empty keys and values are ignored

  ```eno
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
  doc.field('Shopping list')
    => null

  doc.list('Shopping list')
    => []
  ```

  You can explicitly request them though

  ```js
  doc.list('Shopping List', { includeEmpty: true })
    => [ null, null, null, null, null ]
  ```

3. Ambiguity is resolved through usage in code

  ```eno
  Shopping List:
  -
  ```
  ```js
  doc.field('Shopping List')
    => null

  doc.list('Shopping List')
    => [ null ]
  ```

4. And enforced by user-friendly, built-in, localized errors.

  ```eno
  Shopping List:
  -
  -
  ```
  ```js
  doc.list('Shopping List')
    => [ null, null ]

  doc.field('Shopping List')
    => 'Error: "Shopping List" can only be a single value, not a list!'

  document = parse(input, { locale: 'de' })
  doc.field('Einkaufsliste')
    => 'Fehler: "Einkaufsliste" darf nur ein einfacher Wert sein, aber keine Liste!'
  ```

5. Data can also be read out and interpreted sequentially

  ```eno
  Shopping List:
  Shopping List:
  :: Shopping List
  ```
  ```js
  doc.sequential()
    => [{ key: 'Shopping List', value: null },
        { key: 'Shopping List', value: null },
        { key: 'Shopping List', value: null }]
  }
  ```
