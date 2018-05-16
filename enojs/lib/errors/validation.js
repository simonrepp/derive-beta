const { EnoValidationError } = require('../errors.js');
const report = require('../reporters/report.js');

// TODO: Generalize some line gathering code for reporting / maybe even generalize whole error classes (in between, here, not the translations)
// TODO: Need to filter out copied subinstructions for print/selection ranges in some places
// TODO: Look into getting ranges() recursively on error reporting in some EnoSection (eg.) methods

module.exports = {

  exactCountNotMet: (context, name, instructions, expectedCount, sectionInstruction) => {
    const message = context.messages.validation.exactCountNotMet(
      name,
      instructions.count,
      expectedCount
    );

    let selection;
    let snippet;
    if(instructions.length > 0) {
      selection = [[instructions[0].lineNumber, 0], [instructions[0].lineNumber, 0]];
      snippet = report(context, instructions);
    } else {
      if(sectionInstruction.lineNumber < context.instructions.length) {
        selection = [[sectionInstruction.lineNumber + 1, 0], [sectionInstruction.lineNumber + 1, 0]];
      } else {
        selection = [
          [sectionInstruction.lineNumber, sectionInstruction.line.length],
          [sectionInstruction.lineNumber, sectionInstruction.line.length]
        ];
      }
      snippet = report(context, sectionInstruction.subinstructions);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXACT_COUNT_NOT_MET,
    //   meta: { actual: results.length, expected: options.exactCount, name: name },
    //   printRanges: results.map(value => [value.range.beginLine, value.range.endLine]), // Possibly directly pass ranges and let line-printer.js extract the beginLine/endLine itself (unless there needs to be manual picking between begin and end, only possible issue! check :)
    //   editorRanges: results.map(value => value.range)
    // });
  },

  excessName: (context, instruction) => {
    const message = context.messages.validation.excessName(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXCESS_KEY,
    //   meta: { key: element.name },
    //   printRanges: [[element.keyRange.beginLine, element.keyRange.endLine]],
    //   editorRanges: [element.keyRange]
    // });
  },

  expectedDictionaryGotDictionaries: (context, name, instructions) => {
    const lastInstruction = instructions[instructions.length - 1];
    const allSubinstructions = [];
    for(let instruction of instructions) {
      allSubinstructions.push(...instruction.subinstructions);
    }

    const message = context.messages.validation.expectedDictionaryGotDictionaries(name);
    const snippet = report(context, [...instructions, ...allSubinstructions]);
    const selection = [[instructions[0].lineNumber, 0]];

    // TODO: Something quite wrong with selection range code etc., check the whole thing inside out

    if(lastInstruction.subinstructions.length > 0) {
      const lastSubinstruction = lastInstruction.subinstructions[lastInstruction.subinstructions.length - 1];
      selection.push([lastSubinstruction.lineNumber, lastSubinstruction.line.length]);
    } else {
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_DICTIONARY_GOT_DICTIONARIES,
    //   meta: { name: name },
    //   printRanges: elements.map(element => [element.nameRange.beginLine, element.range.endLine]),
    //   editorRanges: elements.map(element => element.range) // TODO: Should be full range / name & value
    // });
  },

  expectedDictionaryGotField: (context, instruction) => {
    const message = context.messages.validation.expectedDictionaryGotField(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_DICTIONARY_GOT_FIELD,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.range]
    // });
  },

  expectedDictionaryGotList: (context, instruction) => {
    const message = context.messages.validation.expectedDictionaryGotList(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_DICTIONARY_GOT_LIST,
    //   meta: { name: name },
    //   printRanges: element.values.map(value => [value.range]),
    //   editorRanges: element.values.map(value => value.range)
    // });
  },

  expectedDictionaryGotSection: (context, instruction) => {
    const message = context.messages.validation.expectedDictionaryGotSection(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_DICTIONARY_GOT_SECTION,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange] // TODO: Should be full range / name & value
    // });
  },

  expectedFieldGotDictionary: (context, instruction) => {
    const message = context.messages.validation.expectedFieldGotDictionary(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_FIELD_GOT_DICTIONARY,
    //   meta: { name: name },
    //   printRanges: [element.range],
    //   editorRanges: [element.nameRange] // TODO: Needs a custom range ? like the printRange basically - from name up to last value
    // });
  },

  expectedFieldGotList: (context, instruction) => {
    const message = context.messages.validation.expectedFieldGotList(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_FIELD_GOT_LIST,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange] // TODO: Needs a custom range ? like the printRange basically - from name up to last value
    // });
  },

  expectedFieldGotMultipleFields: (context, name, instructions) => {
    const lastInstruction = instructions[instructions.length - 1];
    const allSubinstructions = [];
    for(let instruction of instructions) {
      allSubinstructions.push(...instruction.subinstructions);
    }

    const message = context.messages.validation.expectedFieldGotMultipleFields(name);
    const snippet = report(context, [...instructions, ...allSubinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    // See expectedDictionaryGotDictionaries - check * here, weird code :)

    if(lastInstruction.subinstructions.length > 0) {
      const lastSubinstruction = lastInstruction.subinstructions[lastInstruction.subinstructions.length - 1];
      selection.push([lastSubinstruction.lineNumber, lastSubinstruction.line.length]);
    } else {
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_FIELD_GOT_MULTIPLE_FIELDS,
    //   meta: { name: name },
    //   printRanges: elements.map(element => [element.range.beginLine, element.range.endLine]),
    //   editorRanges: elements.map(element => element.range) // TODO: Should be the full ranges i guess
    // });
  },

  expectedFieldGotSection: (context, instruction) => {
    const message = context.messages.validation.expectedFieldGotSection(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_FIELD_GOT_SECTION,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange]
    // });
  },

  expectedListGotDictionary: (context, instruction) => {
    const message = context.messages.validation.expectedListGotDictionary(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_LIST_GOT_DICTIONARY,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange] // TODO: Needs a custom range ? like the printRange basically - from name up to last value
    // });
  },

  expectedListGotSection: (context, instruction) => {
    const message = context.messages.validation.expectedListGotSection(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_LIST_GOT_SECTION,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange]
    // });
  },

  expectedSectionGotDictionary: (context, instruction) => {
    const message = context.messages.validation.expectedSectionGotDictionary(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTION_GOT_DICTIONARY,
    //   meta: { name: name },
    //   printRanges: [element.printRange()],
    //   editorRanges: element.selectionRange()
    // });
  },

  expectedSectionGotEmpty: (context, instruction) => {
    const message = context.messages.validation.expectedSectionGotEmpty(instruction.name);
    const snippet = report(context, instruction);
    const selection = [
      [instruction.lineNumber, 0],
      [instruction.lineNumber, instruction.line.length]
    ];

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTION_GOT_EMPTY,
    //   meta: { name: name },
    //   printRanges: [element.printRange()],
    //   editorRanges: [element.nameRange]
    // });
  },

  expectedSectionGotField: (context, instruction) => {
    const message = context.messages.validation.expectedSectionGotField(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTION_GOT_FIELD,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange] // TODO: Needs a custom range ! like the printRange basically - from name up to last value
    // });
  },

  expectedSectionGotList: (context, instruction) => {
    const message = context.messages.validation.expectedSectionGotList(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTION_GOT_LIST,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange]
    // });
  },

  expectedSectionGotSections: (context, name, instructions) => {
    const lastInstruction = instructions[instructions.length - 1];
    const allSubinstructions = [];
    for(let instruction of instructions) {
      allSubinstructions.push(...instruction.subinstructions);
    }

    const message = context.messages.validation.expectedSectionGotSections(name);
    const snippet = report(context, [...instructions, ...allSubinstructions]);
    const selection = [[instructions[0].lineNumber, 0]];

    // TODO: Something quite wrong with selection range code etc., check the whole thing inside out

    if(lastInstruction.subinstructions.length > 0) {
      const lastSubinstruction = lastInstruction.subinstructions[lastInstruction.subinstructions.length - 1];
      selection.push([lastSubinstruction.lineNumber, lastSubinstruction.line.length]);
    } else {
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTION_GOT_SECTIONS,
    //   meta: { name: name },
    //   printRanges: elements.map(element => [element.nameRange.beginLine, element.range.endLine]),
    //   editorRanges: elements.map(element => element.range)
    // });
  },

  expectedSectionsGotDictionary: (context, instruction) => {
    const message = context.messages.validation.expectedSectionsGotDictionary(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTIONS_GOT_DICTIONARY,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange] // TODO: Needs a custom range ? like the printRange basically - from name up to last value
    // });
  },

  expectedSectionsGotEmpty: (context, instruction) => {
    const message = context.messages.validation.expectedSectionsGotEmpty(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTIONS_GOT_EMPTY,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange] // TODO: Needs a custom range ? like the printRange basically - from name up to last value
    // });
  },

  expectedSectionsGotField: (context, instruction) => {
    const message = context.messages.validation.expectedSectionsGotField(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTIONS_GOT_FIELD,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange] // TODO: Needs a custom range ? like the printRange basically - from name up to last value
    // });
  },

  expectedSectionsGotList: (context, instruction) => {
    const message = context.messages.validation.expectedSectionsGotList(instruction.name);
    const snippet = report(context, [instruction, ...instruction.subinstructions]);
    const selection = [[instruction.lineNumber, 0]];

    if(instruction.subinstructions.length > 0) {
      const lastInstruction = instruction.subinstructions[instruction.subinstructions.length - 1];
      selection.push([lastInstruction.lineNumber, lastInstruction.line.length]);
    } else {
      selection.push([instruction.lineNumber, instruction.line.length]);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.EXPECTED_SECTIONS_GOT_LIST,
    //   meta: { name: name },
    //   printRanges: [[element.nameRange.beginLine, element.range.endLine]],
    //   editorRanges: [element.nameRange]
    // });
  },

  fabricateValueError: (context, message, valueInstruction) => {
    let messageProcessed;
    if(message) {
      if(typeof message === 'function') {
        messageProcessed = message(this);
      } else {
        messageProcessed = message;
      }
    } else {
      messageProcessed = context.messages.validation.genericError(name);
    }

    const snippet = report(context, valueInstruction);
    const selection = [
      [valueInstruction.lineNumber, valueInstruction.ranges.value[0]],
      [valueInstruction.lineNumber, valueInstruction.ranges.value[1]]
    ];

    return new EnoValidationError(messageProcessed, snippet, selection);

    // const error = {
    //   printRanges: [[this.range.beginLine, this.range.endLine]],
    //   editorRanges: [this.range]
    // };
  },

  maxCountNotMet: (context, name, instructions, maxCount, sectionInstruction) => {
    const message = context.messages.validation.maxCountNotMet(
      name,
      instructions.count,
      maxCount
    );

    let selection;
    let snippet;
    if(instructions.length > 0) {
      selection = [[instructions[0].lineNumber, 0], [instructions[0].lineNumber, 0]];
      snippet = report(context, instructions);
    } else {
      if(sectionInstruction.lineNumber < context.instructions.length) {
        selection = [[sectionInstruction.lineNumber + 1, 0], [sectionInstruction.lineNumber + 1, 0]];
      } else {
        selection = [
          [sectionInstruction.lineNumber, sectionInstruction.line.length],
          [sectionInstruction.lineNumber, sectionInstruction.line.length]
        ];
      }
      snippet = report(context, sectionInstruction.subinstructions);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.MAX_COUNT_NOT_MET,
    //   meta: { actual: results.length, expected: options.maxCount, name: name },
    //   printRanges: results.map(value => [value.range.beginLine, value.range.endLine]),
    //   editorRanges: results.map(value => value.range)
    // });
  },

  minCountNotMet: (context, name, instructions, minCount, sectionInstruction) => {
    const message = context.messages.validation.minCountNotMet(
      name,
      instructions.count,
      minCount
    );

    let selection;
    let snippet;
    if(instructions.length > 0) {
      selection = [[instructions[0].lineNumber, 0], [instructions[0].lineNumber, 0]];
      snippet = report(context, instructions);
    } else {
      if(sectionInstruction.lineNumber < context.instructions.length) {
        selection = [[sectionInstruction.lineNumber + 1, 0], [sectionInstruction.lineNumber + 1, 0]];
      } else {
        selection = [
          [sectionInstruction.lineNumber, sectionInstruction.line.length],
          [sectionInstruction.lineNumber, sectionInstruction.line.length]
        ];
      }
      snippet = report(context, sectionInstruction.subinstructions);
    }

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.MIN_COUNT_NOT_MET,
    //   meta: { actual: results.length, expected: options.minCount, name: name },
    //   printRanges: results.map(value => [value.range.beginLine, value.range.endLine]),
    //   editorRanges: results.map(value => value.range)
    // });
  },

  missingDictionary: (context, name, sectionInstruction) => {

    const message = context.messages.validation.missingDictionary(name);
    const snippet = report(context, sectionInstruction.subinstructions); // TODO: Traverse down to get all sub-sub-sub-instructions in all branches? (with single helper function everywhere)
    const selection = [
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]],
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]]
    ];

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.MISSING_DICTIONARY,
    //   meta: { key: key },
    //   printRanges: [[this.range.beginLine, this.range.endLine]],
    //   editorRanges: [this.range]
    // });
  },

  missingDictionaryEntry: (context, name, sectionInstruction) => {

    const message = context.messages.validation.missingDictionaryEntry(name);
    const snippet = report(context, sectionInstruction.subinstructions);
    const selection = [
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]],
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]]
    ];

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.MISSING_DICTIONARY_ENTRY,
    //   meta: { name: name },
    //   printRanges: [[this.range.beginLine, this.range.endLine]],
    //   editorRanges: [this.range]
    // });
  },

  missingField: (context, name, sectionInstruction) => {

    const message = context.messages.validation.missingField(name);
    const snippet = report(context, sectionInstruction.subinstructions);
    const selection = [
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]],
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]]
    ];

    throw new EnoValidationError(message, snippet, selection);

    // As seen in section somewhere
    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.MISSING_FIELD,
    //   meta: { name: name },
    //   printRanges: [[section.range.beginLine, section.range.endLine]],
    //   editorRanges: [section.range]
    // });

    // As seen in field() (section)
    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.MISSING_FIELD,
    //   meta: { name: name },
    //   printRanges: [[element.range.beginLine, element.range.endLine]],
    //   editorRanges: [element.cursorRange]
    // });
  },

  missingList: (context, name, sectionInstruction) => {

    const message = context.messages.validation.missingList(name);
    const snippet = report(context, sectionInstruction.subinstructions); // TODO: Traverse down to get all sub-sub-sub-instructions in all branches? (with single helper function everywhere)
    const selection = [
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]],
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]]
    ];

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: ,
    //   meta: { key: value.name },
    //   printRanges: [[this.range.beginLine, this.range.endLine]],
    //   editorRanges: [this.range]
    // });
  },

  missingSection: (context, name, sectionInstruction) => {

    const message = context.messages.validation.missingSection(name);
    const snippet = report(context, sectionInstruction.subinstructions); // TODO: Traverse down to get all sub-sub-sub-instructions in all branches? (with single helper function everywhere)
    const selection = [
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]],
      [sectionInstruction.lineNumber, sectionInstruction.ranges.name[1]]
    ];

    throw new EnoValidationError(message, snippet, selection);

    // throw new EnoValidationError(this.context, {
    //   code: errors.validation.MISSING_SECTION,
    //   meta: { name: name },
    //   printRanges: [[this.range.beginLine, this.range.endLine]],
    //   editorRanges: [this.range]
    // });
  },

  // TODO: load(er)Error instead ?
  valueError: (context, message, valueInstruction) => {
    let messageProcessed;
    if(message) {
      if(typeof message === 'function') {
        messageProcessed = message(this);
      } else {
        messageProcessed = message;
      }
    } else {
      messageProcessed = context.messages.validation.genericError(name);
    }

    const snippet = report(context, valueInstruction);
    const selection = [
      [valueInstruction.lineNumber, valueInstruction.ranges.name[0]],  // .name is a temporal workaround, but not what we want. TODO
      [valueInstruction.lineNumber, valueInstruction.ranges.name[1]]  // .name is a temporal workaround, but not what we want. TODO
    ];

    return new EnoValidationError(messageProcessed, snippet, selection);

    // As seen in section
    // throw new EnoValidationError(this.context, {
    //   message: message,
    //   printRanges: [[element.range.beginLine, element.range.endLine]],
    //   editorRanges: [element.range]
    // });

    // As seen in DICTIONARY
    // throw new EnoValidationError(this.context, {
    //   message: message,
    //   printRanges: [[value.range.beginLine, value.range.endLine]],
    //   selection: [value.instruction.ranges['key']]
    // });

    // As seen in list
    // throw new EnoValidationError(this.context, {
    //   message: message,
    //   printRanges: [[value.range.beginLine, value.range.endLine]],
    //   editorRanges: [value.range]
    // });
  }

};
