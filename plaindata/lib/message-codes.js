module.exports = {
  errors: {
    parser: {
      ATTRIBUTES_AND_VALUES_MIXED: 1,
      HIERARCHY_LAYER_SKIP: 2,
      INVALID_LINE: 3,
      UNEXPECTED_VALUE: 4,
      UNTERMINATED_MULTILINE_VALUE: 5
    },
    validation: {
      EXACT_COUNT_NOT_MET: 6,
      MIN_COUNT_NOT_MET: 7,
      MAX_COUNT_NOT_MET: 8,
      DUPLICATE_ATTRIBUTE_KEY: 200,
      EXCESS_KEY: 9,
      EXPECTED_ATTRIBUTE_GOT_COLLECTION: 10,
      EXPECTED_ATTRIBUTE_GOT_SECTION: 11,
      EXPECTED_ATTRIBUTE_GOT_LIST: 12,
      EXPECTED_COLLECTION_GOT_COLLECTIONS: 13,
      EXPECTED_COLLECTION_GOT_ATTRIBUTE: 14,
      EXPECTED_COLLECTION_GOT_LIST: 15,
      EXPECTED_COLLECTION_GOT_SECTION: 16,
      EXPECTED_LIST_GOT_COLLECTION: 17,
      EXPECTED_LIST_GOT_SECTION: 18,
      EXPECTED_SECTION_GOT_ATTRIBUTE: 19,
      EXPECTED_SECTION_GOT_COLLECTION: 20,
      EXPECTED_SECTION_GOT_LIST: 21,
      EXPECTED_SECTION_GOT_SECTIONS: 22,
      EXPECTED_SECTIONS_GOT_ATTRIBUTE: 23,
      EXPECTED_SECTIONS_GOT_COLLECTION: 24, // TODO translations
      EXPECTED_SECTIONS_GOT_LIST: 25,
      GENERIC_ERROR: 26,
      MISSING_ATTRIBUTE: 27,
      MISSING_COLLECTION: 28,
      MISSING_FIELD: 31,
      MISSING_LIST: 290,
      MISSING_SECTION: 30
    }
  },
  strings: {
    SNIPPET_CONTENT_HEADER: 32,
    SNIPPET_LINE_HEADER: 33
  }
};

// TODO: Renumber in the end