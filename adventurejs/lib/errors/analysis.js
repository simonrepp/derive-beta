const { AdventureParseError } = require('../errors.js');
const report = require('../reporters/text.js');

module.exports = {

  dictionaryEntryInField: (context, entryInstruction, fieldInstruction) => {
    const message = context.messages.analysis.dictionaryEntryInField(entryInstruction.lineNumber);
    const snippet = report(
      context,
      entryInstruction,
      [fieldInstruction, ...fieldInstruction.subinstructions]
    );

    throw new AdventureParseError(message, snippet);
  },

  dictionaryEntryInList: (context, entryInstruction, listInstruction) => {
    const message = context.messages.analysis.dictionaryEntryInList(entryInstruction.lineNumber);
    const snippet = report(
      context,
      entryInstruction,
      [listInstruction, ...listInstruction.subinstructions]
    );

    throw new AdventureParseError(message, snippet);
  },

  duplicateDictionaryEntryName: (context, dictionaryInstruction, entryInstruction) => {
    const message = context.messages.analysis.duplicateDictionaryEntryName(
      dictionaryInstruction.name,
      entryInstruction.name
    );

    const snippet = report(
      context,
      [entryInstruction, dictionaryInstruction.subinstructions.find(instruction => instruction.name === entryInstruction.name)],
      [dictionaryInstruction, ...dictionaryInstruction.subinstructions]
    );

    throw new AdventureParseError(message, snippet);
  },

  fieldAppendInDictionary: (context, appendInstruction, dictionaryInstruction) => {
    const message = context.messages.analysis.dictionaryEntryInList(appendInstruction.lineNumber);
    const snippet = report(
      context,
      appendInstruction,
      [dictionaryInstruction, ...dictionaryInstruction.subinstructions]
    );

    throw new AdventureParseError(message, snippet);
  },

  fieldAppendInList: (context, appendInstruction, listInstruction) => {
    const message = context.messages.analysis.fieldAppendInList(appendInstruction.lineNumber);
    const snippet = report(
      context,
      appendInstruction,
      [listInstruction, ...listInstruction.subinstructions]
    );

    throw new AdventureParseError(message, snippet);
  },

  listItemInField: (context, itemInstruction, fieldInstruction) => {
    const message = context.messages.analysis.listItemInField(itemInstruction.lineNumber);
    const snippet = report(
      context,
      itemInstruction,
      [fieldInstruction, ...fieldInstruction.subinstructions]
    );

    throw new AdventureParseError(message, snippet);
  },

  listItemInDictionary: (context, itemInstruction, dictionaryInstruction) => {
    const message = context.messages.analysis.listItemInDictionary(itemInstruction.lineNumber);
    const snippet = report(
      context,
      itemInstruction,
      [dictionaryInstruction, ...dictionaryInstruction.subinstructions]
    );

    throw new AdventureParseError(message, snippet);
  },

  missingNameForDictionaryEntry: (context, instruction) => {
    const message = context.messages.analysis.missingNameForDictionaryEntry(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  missingNameForFieldAppend: (context, instruction) => {
    const message = context.messages.analysis.missingNameForFieldAppend(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  missingNameForListItem: (context, instruction) => {
    const message = context.messages.analysis.missingNameForListItem(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  sectionHierarchyLayerSkip: (context, subSectionInstruction, superSectionInstruction) => {
    const message = context.messages.analysis.sectionHierarchyLayerSkip(subSectionInstruction.lineNumber);
    const snippet = report(context, [subSectionInstruction, superSectionInstruction]);

    throw new AdventureParseError(message, snippet);
  }

};
