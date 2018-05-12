# Top-down resolver pass (3)

module Adventure
  def self.resolve(instructions)
    document = Section.new(nil)

    instructions.each do |instruction|

      if instruction[:type] == :list
        list = List.new(instruction[:key])

        # TODO: Here we should only check merged instructions -
        #       regular instructions can be validated on the lexer pass already
        instruction[:children].each do |child_instruction|
          next if [:comment, :empty_line].include?(child_instruction[:type])

          if child_instruction[:merged]
            raise ParseError.new("You cannot merge a mapping pair into a list") if child_instruction[:type] == :map_pair
            raise ParseError.new("You cannot merge a field into a list") if child_instruction[:type] == :field
            raise ParseError.new("You cannot merge a verbatim field into a list") if child_instruction[:type] == :verbatim_field

            child_instruction[:children].each do |merged_child_instruction|
              next if [:comment, :empty_line].include?(merged_child_instruction[:type])
              list.append(merged_child_instruction[:value])
            end
          else
            list.append(child_instruction[:value])
          end
        end

        document.append(instruction[:key], list)

        next
      end

      # TODO: Precompile arrays of :list/:map/:field instructions to check after solver-pass is through, already in solver-pass ? (no need to reiterate everything)
      # TODO: Also for :map, :field

      if instruction[:type] == :field
        field = Field.new(instruction[:key], instruction[:value])

        instruction[:children].each do |child_instruction|
          next if [:comment, :empty_line].include?(child_instruction[:type])

          if child_instruction[:merged]
            raise ParseError.new("You cannot merge a mapping pair into a field") if child_instruction[:type] == :map_pair
            raise ParseError.new("You cannot merge a list into a field") if child_instruction[:type] == :list
            raise ParseError.new("You cannot merge a verbatim field into a field") if child_instruction[:type] == :verbatim_field

            child_instruction[:children].each do |merged_child_instruction|
              next if [:comment, :empty_line].include?(merged_child_instruction[:type])
              field.append(merged_child_instruction[:value], :space) if merged_child_instruction[:type] == :append_with_space
              field.append(merged_child_instruction[:value], :newline) if merged_child_instruction[:type] == :append_with_newline
            end
          else
            field.append(child_instruction[:value], :space) if child_instruction[:type] == :append_with_space
            field.append(child_instruction[:value], :newline) if child_instruction[:type] == :append_with_newline
          end
        end

        document.append(instruction[:key], field)

        next
      end

      if instruction[:type] == :verbatim_field
        field = Field.new(instruction[:key])

        instruction[:children].each do |child_instruction|
          field.append(child_instruction[:value], :newline) if child_instruction[:type] == :verbatim_field_line
        end

        document.append(instruction[:key], field)

        next
      end


      if instruction[:type] == :map
        mapping = Mapping.new(instruction[:key])

        instruction[:children].each do |child_instruction|
          next if [:comment, :empty_line].include?(child_instruction[:type])

          if child_instruction[:merged]
            raise ParseError.new("You cannot merge a field into a map") if child_instruction[:type] == :field
            raise ParseError.new("You cannot merge a list into a map") if child_instruction[:type] == :list
            raise ParseError.new("You cannot merge a verbatim field into a map") if child_instruction[:type] == :verbatim_field

            child_instruction[:children].each do |merged_child_instruction|
              next if [:comment, :empty_line].include?(merged_child_instruction[:type])
              mapping.append(merged_child_instruction[:key], merged_child_instruction[:value])
            end
          else
            mapping.append(child_instruction[:key], child_instruction[:value])
          end
        end

        document.append(instruction[:key], mapping)

        next
      end

      if instruction[:type] == :section
        section = resolve(instruction[:children])

        if instruction[:merged]
          document.merge(section)
        else
          document.append(instruction[:key], section)
        end

        next
      end
    end

    # section_buffer + previous_sections
    document
  end
end
