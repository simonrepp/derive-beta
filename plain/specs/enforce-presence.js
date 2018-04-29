const assert = require('assert').strict;

const { parse } = require('../plain.js');

const assertPresenceNotEnforcedByDefault = () => {
  const sample = `
    == map
    present = yes
    # section
    == map in section
    present = yes
  `;

  const doc = parse(sample);
  const section = doc.section('section');
  const result = {
    mapAttribute: doc.map('map').pair('missing'),
    field: doc.field('missing'),
    section: {
      mapAttribute: section.map('map in section').pair('missing'),
      field: section.field('missing')
    }
  };

  const expected = {
    mapAttribute: null,
    field: null,
    section: {
      mapAttribute: null,
      field: null
    }
  };

  assert.deepStrictEqual(result, expected);
};

const assertPresenceEnforcedWhenRequested = () => {
  const sample = `
    == map
    present = yes
    # section
    == map in section
    present = yes
  `;

  const doc = parse(sample);

  doc.enforcePresence(true);

  const section = doc.section('section');

  assert.throws(() => doc.map('map').pair('missing'), /Das Attribut "missing" fehlt/);
  assert.throws(() => doc.field('missing'), /Das Feld "missing" fehlt/);
  assert.throws(() => section.map('map in section').pair('missing'), /Das Attribut "missing" fehlt/);
  assert.throws(() => section.field('missing'), /Das Feld "missing" fehlt/);
};

module.exports = () => {
  assertPresenceNotEnforcedByDefault();
  assertPresenceEnforcedWhenRequested();
};
