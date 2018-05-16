const { AdventureParseError } = require('../errors.js');
const report = require('../reporters/report.js');

module.exports = {

  copyingBlockIntoDictionary: (context, instruction) => {
    const message = context.messages.resolution.copyingBlockIntoDictionary(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingBlockIntoList: (context, instruction) => {
    const message = context.messages.resolution.copyingBlockIntoList(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingBlockIntoSection: (context, instruction) => {
    const message = context.messages.resolution.copyingBlockIntoSection(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingDictionaryIntoField: (context, instruction) => {
    const message = context.messages.resolution.copyingDictionaryIntoField(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingDictionaryIntoList: (context, instruction) => {
    const message = context.messages.resolution.copyingDictionaryIntoList(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingDictionaryIntoSection: (context, instruction) => {
    const message = context.messages.resolution.copyingDictionaryIntoSection(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingFieldIntoDictionary: (context, instruction) => {
    const message = context.messages.resolution.copyingFieldIntoDictionary(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingFieldIntoList: (context, instruction) => {
    const message = context.messages.resolution.copyingFieldIntoList(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingFieldIntoSection: (context, instruction) => {
    const message = context.messages.resolution.copyingFieldIntoSection(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingListIntoDictionary: (context, instruction) => {
    const message = context.messages.resolution.copyingListIntoDictionary(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingListIntoField: (context, instruction) => {
    const message = context.messages.resolution.copyingListIntoField(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingListIntoSection: (context, instruction) => {
    const message = context.messages.resolution.copyingListIntoSection(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingSectionIntoDictionary: (context, instruction) => {
    const message = context.messages.resolution.copyingSectionIntoDictionary(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingSectionIntoField: (context, instruction) => {
    const message = context.messages.resolution.copyingSectionIntoField(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingSectionIntoList: (context, instruction) => {
    const message = context.messages.resolution.copyingSectionIntoList(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  copyingSectionIntoName: (context, instruction) => {
    const message = context.messages.resolution.copyingSectionIntoName(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  cyclicDependency: (context, instruction, instructionChain) => {
    const firstOccurrence = instructionChain.indexOf(instruction);
    const feedbackChain = instructionChain.slice(firstOccurrence);
    const firstInstruction = feedbackChain[0];
    const lastInstruction = feedbackChain[feedbackChain.length - 1];

    let copyInstruction;
    if(lastInstruction.template) {
      copyInstruction = lastInstruction;
    } else if(firstInstruction.template) {
      copyInstruction = firstInstruction;
    }

    const message = context.messages.resolution.cyclicDependency(
      copyInstruction.lineNumber,
      copyInstruction.template
    );
    const snippet = report(
      context,
      copyInstruction,
      feedbackChain.filter(instruction => instruction !== copyInstruction)
    );

    const selection = [
      [copyInstruction.lineNumber, copyInstruction.ranges.template[0]],
      [copyInstruction.lineNumber, copyInstruction.ranges.template[1]]
    ];


    throw new AdventureParseError(message, snippet, selection);
  },

  multipleTemplatesFound: (context, instruction, templates) => {
    const message = context.messages.resolution.multipleTemplatesFound(
      instruction.lineNumber,
      instruction.template
    );

    const snippet = report(context, [instruction, ...templates]);

    throw new AdventureParseError(message, snippet);
  },

  templateNotFound: (context, instruction) => {
    const message = context.messages.resolution.templateNotFound(
      instruction.lineNumber,
      instruction.template
    );
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  }

};
