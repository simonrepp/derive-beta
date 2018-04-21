// TODO: English messages

const { errors, strings } = require('./codes.js');

const messages = {};

messages[errors.parser.ATTRIBUTES_AND_VALUES_MIXED] = meta => `Dem in Zeile ${meta.beginLine} begonnenen Schlüssel ${meta.key} werden sowohl einfache Werte als auch Attribute zugewiesen, er kann aber nur das eine oder das andere enhalten, nicht beides.`;
messages[errors.parser.HIERARCHY_LAYER_SKIP] = meta => `In Zeile ${meta.line} wird eine neue Sektion im Dokument begonnen die zwei Ebenen tiefer liegt als die aktuelle, die in Zeile ${meta.currentSectionBeginLine} begonnen wurde, es darf jedoch immer nur eine Untersektion begonnnen werden die maximal eine Ebene tiefer liegt.`;
messages[errors.parser.INVALID_LINE] = meta => `Die Zeile ${meta.line} folgt keinem erlaubten Muster.`;
messages[errors.parser.UNEXPECTED_VALUE] = meta => `Die Zeile ${meta.line} enthält einen Wert, ohne dass in einer der Zeilen davor ein dazugehöriger Schlüssel angegeben wurde.`;
messages[errors.parser.UNTERMINATED_MULTILINE_VALUE] = meta => `Der mehrzeilige Textblock der in Zeile ${meta.beginLine} beginnt wird bis zum Ende des Dokuments nicht beendet. (Eine abschliessende Zeile ident zu Zeile ${meta.beginLine} nach dem Textblock fehlt)`;

messages[errors.validation.EXACT_COUNT_NOT_MET] = meta => `Das Feld "${meta.key}" enthält ${meta.actual} Einträge, muss aber genau ${meta.expected} Einträge enthalten.`;
messages[errors.validation.MIN_COUNT_NOT_MET] = meta => `Das Feld "${meta.key}" enthält ${meta.actual} Einträge, muss aber mindestens ${meta.minimum} Einträge enthalten.`;
messages[errors.validation.MAX_COUNT_NOT_MET] = meta => `Das Feld "${meta.key}" enthält ${meta.actual} Einträge, darf aber nur maximal ${meta.maximum} Einträge enthalten.`;
messages[errors.validation.EXCESS_KEY] = meta => `Das Feld "${meta.key}" ist nicht vorgesehen, handelt es sich eventuell um einen Tippfehler?`;
messages[errors.validation.EXPECTED_SECTION_GOT_VALUE] = meta => `Das Feld "${meta.key}" enthält einen Wert, muss aber eine Sektion enthalten.`;
messages[errors.validation.EXPECTED_SECTION_GOT_LIST] = meta => `Das Feld "${meta.key}" enthält eine Liste, muss aber eine Sektion enthalten.`;
messages[errors.validation.EXPECTED_SECTIONS_GOT_VALUE] = meta => `Die Liste "${meta.key}" darf nur Sektionen enthalten, enhält aber einen einfachen Wert.`;
messages[errors.validation.EXPECTED_VALUE_GOT_VALUES] = meta => `Das Feld "${meta.key}" enthält eine Liste, muss aber einen einzelnen Wert enthalten.`;
messages[errors.validation.EXPECTED_VALUE_GOT_SECTION] = meta => `Das Feld "${meta.key}" enthält eine Sektion, muss aber einen einzelnen Wert enthalten.`;
messages[errors.validation.EXPECTED_VALUES_GOT_SECTION] = meta => `Die Liste "${meta.key}" darf nur einfache Werte enthalten, enhält aber eine Sektion.`;
messages[errors.validation.GENERIC_ERROR] = meta => `Es besteht ein Problem mit dem Feld "${meta.key}".`;
messages[errors.validation.MISSING_KEY] = meta => `Missing key "${meta.key}" - If the key was provided look out for typos and also pay attention to correct capitalization.`;
messages[errors.validation.MISSING_VALUE] = meta => `Das Feld "${meta.key}" muss ausgefüllt sein.`;

messages[strings.SNIPPET_CONTENT_HEADER] = 'Content';
messages[strings.SNIPPET_LINE_HEADER] = 'Line';

module.exports = messages;
