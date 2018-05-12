const { AdventureParseError } = require('../errors.js');
const report = require('../reporters/report.js');

module.exports = {

  escapedUnterminatedName: (context, instruction) => {
    // TODO: Lexical error fallback refinement concretization here and elsewhere
    const message = context.messages.tokenization.escapedUnterminatedName(instruction.lineNumber);
    const snippet = report(context, instruction);

    throw new AdventureParseError(message, snippet);
  },

  invalidLine: (context, instruction) => {
    const message = context.messages.tokenization.invalidLine(instruction.lineNumber);
    const snippet = report(context, instruction);
    const selection = [
      [instruction.lineNumber, 0],
      [instruction.lineNumber, instruction.line.length]
    ];

    throw new AdventureParseError(message, snippet, selection);
  },

  unterminatedBlock: (context, instruction) => {
    const message = context.messages.tokenization.unterminatedBlock(
      instruction.name,
      instruction.lineNumber
    );

    const snippet = report(
      context,
      instruction,
      context.instructions.filter(filterInstruction => filterInstruction.lineNumber > instruction.lineNumber)
    );

    throw new AdventureParseError(message, snippet);
  }

};
