# errors = require('../errors/analysis.js') TODO
require 'set'

def analyze(context)
  context[:document_instruction] = {
    depth: 0,
    lineNumber: 1,
    name: '<>#:=|\\_ENO_DOCUMENT',
    ranges: {
      section_operator: [0, 0],
      name: [0, 0]
    },
    subinstructions: []
  }

  context[:unresolved_instructions] = []
  context[:template_index] = {}

  last_dictionary_entry_names = nil
  lastNameInstruction = nil
  last_section_instruction = context[:document_instruction]
  active_section_instructions = [context[:document_instruction]]
  unassigned_idle_instructions = []

  context[:instructions].each do |instruction|

    if instruction[:type] ==  'EMPTY' || instruction[:type] == 'COMMENT'
      if lastNameInstruction
        unassigned_idle_instructions.push(instruction)
      else
        last_section_instruction[:subinstructions].push(instruction)
      end

      next
    end

    if instruction[:type] == 'BLOCK_CONTENT'
      lastNameInstruction[:subinstructions].push(instruction)
      next
    end

    if instruction[:type] == :field
      last_section_instruction[:subinstructions].concat(unassigned_idle_instructions)
      unassigned_idle_instructions = []

      instruction[:subinstructions] = []

      lastNameInstruction = instruction

      existingTemplates = context[:template_index][instruction[:name]]
      if existingTemplates
        existingTemplates.push(instruction)
      else
        context[:template_index][instruction[:name]] = [instruction]
      end

      last_section_instruction[:subinstructions].push(instruction)

      next
    end

    if instruction[:type] == :name
      last_section_instruction[:subinstructions].concat(unassigned_idle_instructions)
      unassigned_idle_instructions = []

      instruction[:subinstructions] = []

      lastNameInstruction = instruction

      if instruction[:template]
        context[:unresolved_instructions].push(instruction)
      end

      if instruction[:name] != instruction[:template]
        existingTemplates = context[:template_index][instruction[:name]]

        if existingTemplates
          existingTemplates.push(instruction)
        else
          context[:template_index][instruction[:name]] = [instruction]
        end
      end

      last_section_instruction[:subinstructions].push(instruction)

      next
    end

    if instruction[:type] == 'LIST_ITEM'
      if lastNameInstruction == nil
        errors.missingNameForListItem(context, instruction)
      end

      lastNameInstruction[:subinstructions].concat(unassigned_idle_instructions)
      unassigned_idle_instructions = []

      instruction[:name] = lastNameInstruction.name

      if lastNameInstruction[:type] == :list
        lastNameInstruction[:subinstructions].push(instruction)
        next
      end

      if lastNameInstruction[:type] == :name
        lastNameInstruction[:type] = :list
        lastNameInstruction[:subinstructions].push(instruction)
        next
      end

      if lastNameInstruction[:type] == :dictionary
        errors.listItemInDictionary(context, instruction, lastNameInstruction)
      end

      if lastNameInstruction[:type] == :field
        errors.listItemInField(context, instruction, lastNameInstruction)
      end
    end

    if instruction[:type] == :dictionary_entry
      if lastNameInstruction == nil
        errors.missingNameForDictionaryEntry(context, instruction)
      end

      lastNameInstruction[:subinstructions].concat(unassigned_idle_instructions)
      unassigned_idle_instructions = []

      if lastNameInstruction[:type] == :dictionary
        if last_dictionary_entry_names.include?(instruction[:name])
          errors.duplicateDictionaryEntryName(context, lastNameInstruction, instruction)
        else
          last_dictionary_entry_names.add(instruction[:name])
        end

        lastNameInstruction[:subinstructions].push(instruction)
        next
      end

      if lastNameInstruction[:type] == :name
        lastNameInstruction[:type] = :dictionary
        lastNameInstruction[:subinstructions].push(instruction)
        last_dictionary_entry_names = Set.new([instruction[:name]])
        next
      end

      if lastNameInstruction[:type] == :list
        errors.dictionaryEntryInList(context, instruction, lastNameInstruction)
      end

      if lastNameInstruction[:type] == :field
        errors.dictionaryEntryInField(context, instruction, lastNameInstruction)
      end
    end

    if instruction[:type] == :block
      last_section_instruction[:subinstructions].concat(unassigned_idle_instructions)
      unassigned_idle_instructions = []

      instruction[:subinstructions] = []

      lastNameInstruction = instruction

      existingTemplates = context[:template_index][instruction[:name]]
      if existingTemplates
        existingTemplates.push(instruction)
      else
        context[:template_index][instruction[:name]] = [instruction]
      end

      last_section_instruction[:subinstructions].push(instruction)

      next
    end

    if instruction[:type] ==  :block_terminator
      lastNameInstruction[:subinstructions].push(instruction)
      lastNameInstruction = nil
      next
    end

    if instruction[:type] == :field_append
      if lastNameInstruction == nil
        errors.missingNameForFieldAppend(context, instruction)
      end

      lastNameInstruction[:subinstructions].concat(unassigned_idle_instructions)
      unassigned_idle_instructions = []

      if lastNameInstruction[:type] == :field
        lastNameInstruction[:subinstructions].push(instruction)
        next
      end

      if lastNameInstruction[:type] == :name
        lastNameInstruction[:type] = :field
        lastNameInstruction[:subinstructions].push(instruction)
        next
      end

      if lastNameInstruction[:type] == :dictionary
        errors.fieldAppendInDictionary(context, instruction, lastNameInstruction)
      end

      if lastNameInstruction[:type] == :list
        errors.fieldAppendInList(context, instruction, lastNameInstruction)
      end
    end

    if instruction[:type] == 'SECTION'
      last_section_instruction[:subinstructions].concat(unassigned_idle_instructions)
      unassigned_idle_instructions = []

      if instruction[:depth] - last_section_instruction[:depth] > 1
        errors.sectionHierarchyLayerSkip(context, instruction, last_section_instruction)
      end

      if instruction[:depth] > last_section_instruction[:depth]
        last_section_instruction[:subinstructions].push(instruction)
      else
        while active_section_instructions[active_section_instructions.length - 1].depth >= instruction[:depth]
          active_section_instructions.pop()
        end

        active_section_instructions[active_section_instructions.length - 1][:subinstructions].push(instruction)
      end

      lastNameInstruction = nil
      last_section_instruction = instruction
      active_section_instructions.push(instruction)

      if instruction[:template]
        context[:unresolved_instructions].push(instruction)
      end

      if instruction[:name] != instruction[:template]
        existingTemplates = context[:template_index][instruction[:name]]

        if existingTemplates
          existingTemplates.push(instruction)
        else
          context[:template_index][instruction[:name]] = [instruction]
        end
      end

      instruction[:subinstructions] = []

      next
    end

  end # ends context[:instructions].each do |instruction|

  if unassigned_idle_instructions.length > 0
    last_section_instruction[:subinstructions].concat(unassigned_idle_instructions)
    unassigned_idle_instructions = []
  end
end
