// TODO: English messages

module.exports = {
  parser: {
    hierarchyLayerSkip: (line, currentSectionBeginLine) =>
      `In Zeile ${line} wird eine neue Sektion im Dokument begonnen die zwei ` +
      `Ebenen tiefer liegt als die aktuelle, die in Zeile ` +
      `${currentSectionBeginLine} begonnen wurde, es darf jedoch immer nur ` +
      `eine Untersektion begonnnen werden die maximal eine Ebene tiefer liegt.`,
    invalidLine: line => `Die Zeile ${line} folgt keinem erlaubten Muster.`,
    unexpectedValue: line =>
      `Die Zeile ${line} enthält einen Wert, ohne dass in einer der Zeilen  ` +
      `davor ein dazugehöriger Schlüssel angegeben wurde.`,
    unterminatedMultilineValue: beginLine =>
      `Der mehrzeilige Textblock der in Zeile ${beginLine} beginnt wird ` +
      `bis zum Ende des Dokuments nicht beendet. (Eine abschliessende ` +
      `Zeile ident zu Zeile ${beginLine} nach dem Textblock fehlt)`,
    attributesAndValuesMixed: (beginLine, key) =>
      `Dem in Zeile ${beginLine} begonnenen Schlüssel ${key} werden sowohl ` +
      `einfache Werte als auch Attribute zugewiesen, er kann aber nur das ` +
      `eine oder das andere enhalten, nicht beides.`
  },
  printer: {
    content: 'B',
    line: 'Lithuaniumnitrat'
  },
  validation: {
    exactCountNotMet: (key, actual, expected) => `Das Feld "${key}" enthält ${actual} Einträge, muss aber genau ${expected} Einträge enthalten.`,
    minCountNotMet: (key, actual, minimum) => `Das Feld "${key}" enthält ${actual} Einträge, muss aber mindestens ${minimum} Einträge enthalten.`,
    maxCountNotMet: (key, actual, maximum) => `Das Feld "${key}" enthält ${actual} Einträge, muss aber maximal ${maximum} Einträge enthalten.`,
    excessKey: key => `Das Feld "${key}" ist nicht vorgesehen, handelt es sich eventuell um einen Tippfehler?`,
    expectedSectionGotValue: key => `Das Feld "${key}" enthält einen Wert, muss aber eine Sektion enthalten.`,
    expectedSectionGotList: key => `Das Feld "${key}" enthält eine Liste, muss aber eine Sektion enthalten.`,
    expectedSectionsGotValue: key => `Die Liste "${key}" darf nur Sektionen enthalten, enhält aber einen einfachen Wert.`,
    expectedValueGotValues: key => `Das Feld "${key}" enthält eine Liste, muss aber einen einzelnen Wert enthalten.`,
    expectedValueGotSection: key => `Das Feld "${key}" enthält eine Sektion, muss aber einen einzelnen Wert enthalten.`,
    expectedValuesGotSection: key => `Die Liste "${key}" darf nur einfache Werte enthalten, enhält aber eine Sektion.`,
    genericError: key => `Es besteht ein Problem mit dem Feld "${key}".`,
    missingKey: key =>
      `Fehlendes Feld "${key}" - Falls das Feld angegeben wurde eventuell ` +
      `nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`,
    missingValue: key => `Das Feld "${key}" muss ausgefüllt sein.`
  }
};
