const errors = require('../errors/tokenization.js');
const matcher = require('../grammar_matcher.js');

module.exports = context => {
  let expectedBlockTerminator = null;
  let unterminatedBlock = null;

  for(let instruction of context.instructions) {

    if(unterminatedBlock) {
      const match = expectedBlockTerminator.exec(instruction.line);

      if(match) {
        instruction.name = match[2];
        instruction.type = 'BLOCK_TERMINATOR';

        const dashes = match[1];
        const operatorColumn = instruction.line.indexOf(dashes);
        const nameColumn = instruction.line.lastIndexOf(instruction.name);

        instruction.ranges = {
          blockOperator: [operatorColumn, operatorColumn + dashes.length],
          name: [nameColumn, nameColumn + instruction.name.length]
        };

        expectedBlockTerminator = null;
        unterminatedBlock = null;

        continue;
      }

      instruction.ranges = { content: [0, instruction.line.length] };
      instruction.type = 'BLOCK_CONTENT';

      continue;
    }

    const match = matcher.GRAMMAR_REGEXP.exec(instruction.line);

    if(match) {

      if(match[matcher.EMPTY_INDEX] !== undefined) {
        instruction.type = 'EMPTY';
        continue;
      }


      if(match[matcher.COMMENT_ANGLE_INDEX]) {
        instruction.type = 'COMMENT';

        const operatorColumn = instruction.line.indexOf('>');
        instruction.ranges = { commentOperator: [operatorColumn, operatorColumn + 1] };

        instruction.text = match[matcher.COMMENT_TEXT_INDEX] || null;

        if(instruction.text) {
          const textColumn = instruction.line.lastIndexOf(instruction.text);
          instruction.ranges.comment = [textColumn, textColumn + instruction.text.length];
        }

        continue;
      }


      if(match[matcher.NAME_OPERATOR_INDEX]) {
        instruction.name = match[matcher.NAME_UNESCAPED_INDEX] ||
                           match[matcher.NAME_ESCAPED_INDEX];

        const nameColumn = instruction.line.indexOf(instruction.name);
        const operatorColumn = instruction.line.indexOf(':', nameColumn + instruction.name.length);

        instruction.ranges = {
          nameOperator: [operatorColumn, operatorColumn + 1],
          name: [nameColumn, nameColumn + instruction.name.length]
        };

        const value = match[matcher.FIELD_VALUE_INDEX];
        if(value) {
          instruction.type = 'FIELD';
          instruction.value = value;

          const valueColumn = instruction.line.lastIndexOf(value);
          instruction.ranges.value = [valueColumn, valueColumn + value.length];
        } else {
          instruction.type = 'NAME';
          instruction.ranges.value = [operatorColumn + 1, instruction.line.length];
        }

        continue;
      }


      if(match[matcher.LIST_ITEM_INDEX]) {
        instruction.type = 'LIST_ITEM';
        instruction.value = match[matcher.LIST_ITEM_VALUE_INDEX] || null;

        const operatorColumn = instruction.line.indexOf('-');
        instruction.ranges = { itemOperator: [operatorColumn, operatorColumn + 1] };

        if(instruction.value) {
          const valueColumn = instruction.line.lastIndexOf(instruction.value);
          instruction.ranges.value = [valueColumn, valueColumn + instruction.value.length];
        } else {
          instruction.ranges.value = [operatorColumn + 1, instruction.line.length];
        }

        continue;
      }


      if(match[matcher.DICTIONARY_ENTRY_EQUALS_INDEX]) {
        instruction.name = match[matcher.NAME_UNESCAPED_INDEX] ||
                    match[matcher.NAME_ESCAPED_INDEX];

        instruction.type = 'DICTIONARY_ENTRY';
        instruction.value = match[matcher.DICTIONARY_ENTRY_VALUE_INDEX] || null;

        const nameColumn = instruction.line.indexOf(instruction.name); // TODO: Account for ``` `` ``` possibility ... :)
        const operatorColumn = instruction.line.indexOf('=', nameColumn + instruction.name.length);

        instruction.ranges = {
          entryOperator: [operatorColumn, operatorColumn + 1],
          name: [nameColumn, nameColumn + instruction.name.length]
        };

        if(instruction.value) {
          const valueColumn = instruction.line.lastIndexOf(instruction.value);
          instruction.ranges.value = [valueColumn, valueColumn + instruction.value.length];
        } else {
          instruction.ranges.value = [operatorColumn + 1, instruction.line.length];
        }

        continue;
      }


      const blockDashes = match[matcher.BLOCK_DASHES_INDEX];
      if(blockDashes) {
        instruction.name = match[matcher.BLOCK_NAME_INDEX];
        instruction.type = 'BLOCK';

        const operatorColumn = instruction.line.indexOf(blockDashes);
        const nameColumn = instruction.line.lastIndexOf(instruction.name);
        instruction.ranges = {
          blockOperator: [operatorColumn, operatorColumn + blockDashes.length],
          name: [nameColumn, nameColumn + instruction.name.length]
        };

        const nameEscaped = instruction.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        expectedBlockTerminator = new RegExp(`^\\s*(${blockDashes})\\s*(${nameEscaped})\\s*$`);
        unterminatedBlock = instruction;

        continue;
      }


      if(match[matcher.APPEND_WITH_NEWLINE_OPERATOR_INDEX]) {
        instruction.separator = '\n';
        instruction.type = 'FIELD_APPEND';
        instruction.value = match[matcher.APPEND_WITH_NEWLINE_VALUE_INDEX] || null;

        const pipeColumn = instruction.line.indexOf('|');
        instruction.ranges = { pipe: [pipeColumn, pipeColumn + 1] };

        if(instruction.value) {
          const valueColumn = instruction.line.lastIndexOf(instruction.value);
          instruction.ranges.value = [valueColumn, valueColumn + instruction.value.length];
        } else {
          instruction.ranges.value = [pipeColumn + 1, instruction.line.length];
        }

        continue;
      }


      if(match[matcher.APPEND_WITH_SPACE_OPERATOR_INDEX]) {
        instruction.separator = ' ';
        instruction.type = 'FIELD_APPEND';
        instruction.value = match[matcher.APPEND_WITH_SPACE_VALUE_INDEX] || null;

        const backslashColumn = instruction.line.indexOf('\\');
        instruction.ranges = { backslash: [backslashColumn, backslashColumn + 1] };

        if(instruction.value) {
          const valueColumn = instruction.line.lastIndexOf(instruction.value);
          instruction.ranges.value = [valueColumn, valueColumn + instruction.value.length];
        } else {
          instruction.ranges.value = [backslashColumn + 1, instruction.line.length];
        }

        continue;
      }


      const sectionHashes = match[matcher.SECTION_HASHES_INDEX];
      if(sectionHashes) {
        instruction.depth = sectionHashes.length;
        instruction.name = match[matcher.SECTION_NAME_UNESCAPED_INDEX] ||
                           match[matcher.SECTION_NAME_ESCAPED_INDEX];

        instruction.type = 'SECTION';

        const hashesColumn = instruction.line.indexOf(blockDashes);
        const nameColumn = instruction.line.indexOf(instruction.name, hashesColumn + sectionHashes.length);

        instruction.ranges = {
          hashes: [hashesColumn, hashesColumn + sectionHashes.length],
          name: [nameColumn, nameColumn + instruction.name.length]
        };

        const template = match[matcher.SECTION_TEMPLATE_INDEX];
        if(template) {
          instruction.template = template;

          const copyColumn = instruction.line.indexOf('<', nameColumn + instruction.name.length);
          const templateColumn = instruction.line.indexOf(template, copyColumn + 1);

          instruction.ranges.copyOperator = [copyColumn, copyColumn + 1];
          instruction.ranges.template = [templateColumn, templateColumn + template.length];
        }

        continue;
      }


      const template = match[matcher.TEMPLATE_INDEX];
      if(template) {
        instruction.name = match[matcher.NAME_UNESCAPED_INDEX] ||
                           match[matcher.NAME_ESCAPED_INDEX];

        instruction.template = template;
        instruction.type = 'NAME';

        const nameColumn = instruction.line.indexOf(instruction.name);
        const operatorColumn = instruction.line.indexOf('<', nameColumn + instruction.name.length);
        const templateColumn = instruction.line.indexOf(template, operatorColumn + 1);

        instruction.ranges = {
          template: [templateColumn, templateColumn + template.length],
          copyOperator: [operatorColumn, operatorColumn + 1],
          name: [nameColumn, nameColumn + instruction.name.length]
        };

        continue;
      }

    } else {
      errors.invalidLine(context, instruction);
    }
  }

  if(unterminatedBlock) {
    errors.unterminatedBlock(context, unterminatedBlock);
  }
};
