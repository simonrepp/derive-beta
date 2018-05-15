const errors = require('../errors/resolution.js');

const consolidate = (context, instruction, template) => {
  if(template.type === 'NAME') {
    return;
  }

  if(instruction.type === 'NAME') {
    if(template.type === 'BLOCK') {
      instruction.type = 'FIELD';
      copyBlock(instruction, template);
    }

    if(template.type === 'FIELD') {
      instruction.type = 'FIELD';
      copyField(instruction, template);
    }

    if(template.type === 'DICTIONARY') {
      instruction.type = 'DICTIONARY';
      copyGeneric(instruction, template);
    }

    if(template.type === 'LIST') {
      instruction.type = 'LIST';
      copyGeneric(instruction, template);
    }

    return;
  }

  if(instruction.type === 'SECTION') {
    if(template.type === 'SECTION') {
      mergeSections(instruction, template, instruction.deepCopy);
    }

    if(template.type === 'BLOCK') {
      errors.copyingBlockIntoSection(context, instruction);
    }

    if(template.type === 'DICTIONARY') {
      errors.copyingDictionaryIntoSection(context, instruction);
    }

    if(template.type === 'FIELD') {
      errors.copyingFieldIntoSection(context, instruction);
    }

    if(template.type === 'LIST') {
      errors.copyingListIntoSection(context, instruction);
    }

    return;
  }

  if(instruction.type === 'DICTIONARY') {
    if(template.type === 'DICTIONARY') {
      mergeDictionaries(instruction, template);
    }

    if(template.type === 'BLOCK') {
      errors.copyingBlockIntoDictionary(context, instruction);
    }

    if(template.type === 'FIELD') {
      errors.copyingFieldIntoDictionary(context, instruction);
    }

    if(template.type === 'LIST') {
      errors.copyingListIntoDictionary(context, instruction);
    }

    if(template.type === 'SECTION') {
      errors.copyingSectionIntoDictionary(context, instruction);
    }

    return;
  }

  if(instruction.type === 'LIST') {
    if(template.type === 'LIST') {
      copyGeneric(instruction, template);
    }

    if(template.type === 'BLOCK') {
      errors.copyingBlockIntoList(context, instruction);
    }

    if(template.type === 'FIELD') {
      errors.copyingFieldIntoList(context, instruction);
    }

    if(template.type === 'DICTIONARY') {
      errors.copyingDictionaryIntoList(context, instruction);
    }

    if(template.type === 'SECTION') {
      errors.copyingSectionIntoList(context, instruction);
    }

    return;
  }

  if(instruction.type === 'FIELD') {
    if(template.type === 'FIELD') {
      copyField(instruction, template);
    }

    if(template.type === 'BLOCK') {
      copyBlock(instruction, template);
    }

    if(template.type === 'DICTIONARY') {
      errors.copyingDictionaryIntoField(context, instruction);
    }

    if(template.type === 'LIST') {
      errors.copyingListIntoField(context, instruction);
    }

    if(template.type === 'SECTION') {
      errors.copyingSectionIntoField(context, instruction);
    }

    return;
  }
}

const copyBlock = (instruction, template) => {
  for(let index = template.subinstructions.length - 1; index >= 0; index--) {
    const templateSubinstruction = template.subinstructions[index];
    if(templateSubinstruction.type === 'BLOCK_CONTENT') {
      instruction.subinstructions.unshift({
        lineNumber: templateSubinstruction.lineNumber,
        ranges: templateSubinstruction.ranges,
        separator: '\n',
        type: 'FIELD_APPEND',
        value: templateSubinstruction.line
      });
    }
  }
}

const copyField = (instruction, template) => {
  if(template.value) {
    instruction.subinstructions.unshift({
      lineNumber: template.lineNumber,
      ranges: template.ranges,
      separator: '\n',
      type: 'FIELD_APPEND',
      value: template.value
    });
  }

  copyGeneric(instruction, template);
}

const copyGeneric = (instruction, template) => {
  for(let index = template.subinstructions.length - 1; index >= 0; index--) {
    const templateSubinstruction = template.subinstructions[index];

    if(templateSubinstruction.type === 'COMMENT' ||
       templateSubinstruction.type === 'EMPTY') {
      continue;
    }

    const clone = Object.assign({}, template.subinstructions[index]);
    instruction.subinstructions.unshift(clone);
  }
}

const mergeDictionaries = (instruction, template) => {
  const existingEntryNames = instruction.subinstructions
                                        .filter(instruction => instruction.type === 'DICTIONARY_ENTRY')
                                        .map(instruction => instruction.name);


  for(let index = template.subinstructions.length - 1; index >= 0; index--) {
    const templateSubinstruction = template.subinstructions[index];

    if(templateSubinstruction.type !== 'DICTIONARY_ENTRY') { continue; }

    if(!existingEntryNames.includes(templateSubinstruction.name)) {
      const clone = Object.assign({}, templateSubinstruction);
      instruction.subinstructions.unshift(clone);
    }
  }
}

const mergeSections = (instruction, template, deepMerge) => {
  const existingSubinstructionsNameIndex = {};

  for(let index = template.subinstructions.length - 1; index >= 0; index--) {
    const templateSubinstruction = template.subinstructions[index];

    if(templateSubinstruction.type === 'COMMENT' || templateSubinstruction.type === 'EMPTY') {
      continue;
    }

    let existingSubinstructions = existingSubinstructionsNameIndex[templateSubinstruction.name];

    if(existingSubinstructions === undefined) {
      existingSubinstructions = instruction.subinstructions.filter(instruction => {
        return instruction.name === templateSubinstruction.name;
      });

      existingSubinstructionsNameIndex[templateSubinstruction.name] = existingSubinstructions;
    }

    if(existingSubinstructions.length === 0) {
      const clone = Object.assign({}, templateSubinstruction);
      instruction.subinstructions.unshift(clone);
      continue;
    }

    if(!deepMerge || existingSubinstructions.length > 1) {
      continue;
    }

    if(templateSubinstruction.type === 'DICTIONARY' &&
       existingSubinstructions[0].type === 'DICTIONARY') {

      const templateSubinstructionsWithSameName = template.subinstructions.filter(instruction => {
        return instruction.name === templateSubinstruction.name;
      });

      if(templateSubinstructionsWithSameName.length === 1) {
        mergeDictionaries(existingSubinstructions[0], templateSubinstruction);
      }
    }

    if(templateSubinstruction.type === 'SECTION' &&
       existingSubinstructions[0].type === 'SECTION') {

      const templateSubinstructionsWithSameName = template.subinstructions.filter(instruction => {
        return instruction.name === templateSubinstruction.name;
      });

      if(templateSubinstructionsWithSameName.length === 1) {
        mergeSections(existingSubinstructions[0], templateSubinstruction, true);
      }
    }
  }
}

const resolve = (context, instruction, previousInstructions = []) => {
  if(instruction.type === 'EMPTY' || instruction.type === 'COMMENT') {
    return;
  }

  if(previousInstructions.includes(instruction)) {
    errors.cyclicDependency(context, instruction, previousInstructions);
  }

  if(instruction.type === 'SECTION') {
    for(let subinstruction of instruction.subinstructions) {
      resolve(context, subinstruction, [...previousInstructions, instruction]);
    }
  }

  if(instruction.template && !instruction.consolidated) {
    const candidates = context.templateIndex[instruction.template];

    if(candidates === undefined) {
      errors.templateNotFound(context, instruction);
    }

    if(candidates.length > 1) {
      errors.multipleTemplatesFound(context, instruction, candidates);
    }

    const template = candidates[0];

    resolve(context, template, [...previousInstructions, instruction]);
    consolidate(context, instruction, template);

    instruction.consolidated = true;

    const index = context.unresolvedInstructions.indexOf(instruction);
    context.unresolvedInstructions.splice(index, 1);
  }
}

module.exports = context => {
  while(context.unresolvedInstructions.length > 0) {
    resolve(context, context.unresolvedInstructions[0]);
  }
};
