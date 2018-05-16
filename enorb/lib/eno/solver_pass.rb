# Bottom-up solver pass (2)

module Eno
  def self.solve(lexed)
    definitions = lexed[:definitions]
    instructions = lexed[:instructions]

    key_buffer = []
    key_scope = :empty
    section_buffer = []
    previous_sections = []

    instructions.reverse_each do |instruction|

      if instruction[:type] == :comment ||
         instruction[:type] == :empty_line
        if key_scope == :empty
          section_buffer.unshift(instruction)
        else
          key_buffer.unshift(instruction)
        end

        next
      end

      if instruction[:type] == :key ||
         instruction[:type] == :field

        instruction[:type] = key_scope if instruction[:type] == :key

        if key_scope == :empty
          instruction[:children] = []
        else
          instruction[:children] = key_buffer
          key_buffer = []
          key_scope = :empty
        end

        section_buffer.unshift(instruction) unless instruction[:definition]

        next
      end

      if instruction[:type] == :list_item ||
         instruction[:type] == :map_pair ||
         instruction[:type] == :append_with_newline ||
         instruction[:type] == :append_with_space

        key_buffer.unshift(instruction)
        key_scope =
          case instruction[:type]
          when :list_item then :list
          when :map_pair then :map
          when :append_with_newline then :field
          when :append_with_space then :field
          end

        next
      end

      if instruction[:type] == :verbatim_field
        instruction[:children] = key_buffer
        key_buffer = []
        section_buffer.unshift(instruction) unless instruction[:definition]

        next
      end

      if instruction[:type] == :section
        instruction[:children] = section_buffer
        section_buffer = []

        while previous_sections.any? && instruction[:depth] < previous_sections.first[:depth]
          instruction[:children].push(previous_sections.shift)
        end

        previous_sections.unshift(instruction) unless instruction[:definition]

        next
      end

      if instruction[:type] == :field_merge
        merged_instruction = definitions[instruction[:key]]

        if merged_instruction[:type] != :field
          raise ParseError.new(
            code: Messages::Parser::MERGE_TYPE_MISMATCHES_DEFINITION_TYPE,
            meta: { key: instruction[:key] }
          )
        end
      end

      if [:field_merge, :list_merge, :map_merge, :section_merge].include?(instruction[:type])
        merged_instruction = definitions[instruction[:key]]

        unless merged_instruction
          raise ParseError.new(
            code: Messages::Parser::NO_REFERENCE_DEFINITION,
            meta: { key: instruction[:key] }
          )
        end

        merged_instruction[:merged] = true

        if merged_instruction[:type] == :section
          if key_scope != :empty
            raise ParseError.new("Attempting to merge a section into a #{key_scope}")
          end

          section_buffer.unshift(merged_instruction)
        else
          key_buffer.unshift(merged_instruction)
        end

        # TODO
        # instruction[:children] = key_buffer
        # key_buffer = []
        # section_buffer.unshift(instruction)

        next
      end
    end

    section_buffer + previous_sections
  end
end
