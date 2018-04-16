const sample = `
Temperatur: kalt
Wetter: warm

--- Vorschau
grau
in
grau
--- Vorschau

--- Temperatur
LAU
--- Temperatur

# Lagen

hoch: kalt
nieder: warm
`;

{
  'Temperatur': [
    {
      keyRange: {
        line: 1,
        beginColumn: 0,
        endColumn: 10
      },
      value: 'kalt',
      valueRange: {
        line: 1,
        beginColumn: 12,
        endColumn: 16
      }
    },
    {
      keyRange: {
        beginLine: 11,
        endLine: 13
      },
      value: 'LAU',
      valueRange: {
        line: 12,
        beginColumn: 0,
        endColumn: 3
      }
    }
  ],
  'Vorschau': [
    {
      keyRange: {
        beginLine: 3,
        endLine: 7
      },
      value: 'grau\nin\ngrau',
      valueRange: {
        beginLine: 4,
        endLine: 6
      }
    }
  ],
  'Wetter': [
    keyRange: {
      line: 2,
      beginColumn: 0,
      endColumn: 6
    },
    value: 'kalt',
    valueRange: {
      line: 2,
      beginColumn: 8,
      endColumn: 12
    }
  ]
}
