const { errors, strings } = require('../message-codes.js');

const messages = [
  [
    errors.parser.ATTRIBUTES_AND_VALUES_MIXED,
    meta => `Dem in Zeile ${meta.beginLine} begonnenen Schlüssel ${meta.key} werden sowohl einfache Werte als auch Attribute zugewiesen, er kann aber nur das eine oder das andere enhalten, nicht beides.`
  ],
  [
    errors.parser.HIERARCHY_LAYER_SKIP,
    meta => `In Zeile ${meta.line} wird eine neue Sektion im Dokument begonnen die zwei Ebenen tiefer liegt als die aktuelle, die in Zeile ${meta.currentSectionBeginLine} begonnen wurde, es darf jedoch immer nur eine Untersektion begonnnen werden die maximal eine Ebene tiefer liegt.`
  ],
  [
    errors.parser.INVALID_LINE,
    meta => `Die Zeile ${meta.line} folgt keinem erlaubten Muster.`
  ],
  [
    errors.parser.UNEXPECTED_VALUE,
    meta => `Die Zeile ${meta.line} enthält einen Wert, ohne dass in einer der Zeilen davor ein dazugehöriger Schlüssel angegeben wurde.`
  ],
  [
    errors.parser.UNTERMINATED_VERBATIM_FIELD,
    meta => `Der mehrzeilige Textblock der in Zeile ${meta.beginLine} beginnt wird bis zum Ende des Dokuments nicht beendet. (Eine abschliessende Zeile ident zu Zeile ${meta.beginLine} nach dem Textblock fehlt)`
  ],
  [
    errors.validation.DUPLICATE_ATTRIBUTE_KEY,
    meta => `Die Kollektion "${meta.collectionKey}" enthält zwei Attribute mit dem Namen "${meta.attributeKey}", das ist aber nicht erlaubt.`
  ],
  [
    errors.validation.EXACT_COUNT_NOT_MET,
    meta => `Das Feld "${meta.key}" enthält ${meta.actual} Einträge, muss aber genau ${meta.expected} Einträge enthalten.`
  ],
  [
    errors.validation.EXCESS_KEY,
    meta => `Das Feld "${meta.key}" ist nicht vorgesehen, handelt es sich eventuell um einen Tippfehler?`
  ],
  [
    errors.validation.EXPECTED_COLLECTION_GOT_COLLECTIONS,
    meta => `Statt der erwarteten einzelnen Kollektion "${meta.key}" wurden mehrere Kollektionen mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_COLLECTION_GOT_FIELD,
    meta => `Statt der erwarteten Kollektion "${meta.key}" wurden ein Feld mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_COLLECTION_GOT_LIST,
    meta => `Statt der erwarteten Kollektion "${meta.key}" wurde eine Liste mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_COLLECTION_GOT_SECTION,
    meta => `Statt der erwarteten Kollektion "${meta.key}" wurden eine Sektion mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_FIELD_GOT_COLLECTION,
    meta => `Statt dem erwarteten Feld "${meta.key}" wurde eine Kollektion mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_FIELD_GOT_LIST,
    meta => `Statt dem erwarteten Feld "${meta.key}" wurde eine Liste mit dem selben Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_FIELD_GOT_MULTIPLE_FIELDS,
    meta => `Statt dem erwarteten einzelnen Feld "${meta.key}" wurden mehrere Felder mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_FIELD_GOT_SECTION,
    meta => `Statt dem erwarteten Feld "${meta.key}" wurde eine Sektion mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_LIST_GOT_COLLECTION,
    meta => `"${meta.key}" muss eine Auflistung von Werten sein, enhält jedoch eine Kollektion.`
  ],
  [
    errors.validation.EXPECTED_LIST_GOT_SECTION,
    meta => `"${meta.key}" muss eine Auflistung von Werten sein, enhält jedoch eine Sektion.`
  ],
  [
    errors.validation.EXPECTED_SECTION_GOT_COLLECTION,
    meta => `Unter dem Namen "${meta.key}" wurde eine Kollektion vorgefunden, es ist aber eine Sektion vorgesehen.`
  ],
  [
    errors.validation.EXPECTED_SECTION_GOT_EMPTY,
    meta => `Statt der erwarteten Sektion "${meta.key}" wurde ein leeres Feld vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_SECTION_GOT_FIELD,
    meta => `Statt der erwarteten Sektion "${meta.key}" wurde ein Feld vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_SECTION_GOT_LIST,
    meta => `Das Feld "${meta.key}" enthält eine Liste, muss aber eine Sektion enthalten.`
  ],
  [
    errors.validation.EXPECTED_SECTION_GOT_SECTIONS,
    meta => `Statt der erwarteten einzelnen Sektion "${meta.key}" wurden mehrere Sektionen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_SECTIONS_GOT_COLLECTION,
    meta => `Es wurden nur Sektionen mit dem Namen "${meta.key}" erwartet, jedoch eine Kollektion vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_SECTIONS_GOT_EMPTY,
    meta => `Statt erwarteten Sektionen mit dem Namen "${meta.key}" wurde ein leeres Feld vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_SECTIONS_GOT_FIELD,
    meta => `Statt erwarteten Sektionen mit dem Namen "${meta.key}" wurde ein Feld mit diesem Namen vorgefunden.`
  ],
  [
    errors.validation.EXPECTED_SECTIONS_GOT_LIST,
    meta => `Es wurden Sektionen mit dem Namen "${meta.key}" erwartet, aber eine Liste vorgefunden.`
  ],
  [
    errors.validation.GENERIC_ERROR,
    meta => `Es besteht ein Problem mit dem Feld "${meta.key}".`
  ],
  [
    errors.validation.MAX_COUNT_NOT_MET,
    meta => `Das Feld "${meta.key}" enthält ${meta.actual} Einträge, darf aber nur maximal ${meta.maximum} Einträge enthalten.`
  ],
  [
    errors.validation.MIN_COUNT_NOT_MET,
    meta => `Das Feld "${meta.key}" enthält ${meta.actual} Einträge, muss aber mindestens ${meta.minimum} Einträge enthalten.`
  ],
  [
    errors.validation.MISSING_ATTRIBUTE,
    meta => `Das Attribut "${meta.key}" fehlt - falls es angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`
  ],
  [
    errors.validation.MISSING_COLLECTION,
    meta => `Die Kollektion "${meta.key}" fehlt - falls sie angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`
  ],
  [
    errors.validation.MISSING_FIELD,
    meta => `Das Feld "${meta.key}" fehlt.`
  ],
  [
    errors.validation.MISSING_LIST,
    meta => `Die Liste "${meta.key}" fehlt - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`
  ],
  [
    errors.validation.MISSING_SECTION,
    meta => `Die Sektion "${meta.key}" fehlt.`
  ],
  [
    strings.SNIPPET_CONTENT_HEADER,
    'Inhalt'
  ],
  [
    strings.SNIPPET_LINE_HEADER,
    'Zeile'
  ]
];

const mapped = {};

for(let [code, message] of messages) {
  mapped[code] = message;
}

module.exports = mapped;
