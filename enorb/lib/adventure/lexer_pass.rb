module Adventure
  # TODO: Grammar validation / errors
  # TODO: Consider the "remember definitions / remember references -> resolve during parsing -> re-resolve at the end -> if stale references left after all there is an unmet reference error"

  class Lexer
    def initialize(input)
      @lines = input.split(/\r?\n/)
      @line_content = @lines.first
      @line_number = 1

      @definitions = {}
      @instructions = []
    end

    def any_key(definition, key)
      instruction = {
        definition: !!definition,
        key: key,
        line: @line_number,
        type: :key
      }

      @instructions.push(instruction)
      define(instruction) if definition
    end

    def append_with_newline(value)
      @instructions.push({
        line: @line_number,
        type: :append_with_newline,
        value: value
      })
    end

    def append_with_space(value)
      @instructions.push({
        line: @line_number,
        type: :append_with_space,
        value: value
      })
    end

    def comment(text)
      @instructions.push({
        line: @line_number,
        type: :comment,
        text: text
      })
    end

    def define(instruction)
      previous_definition = @definitions[instruction[:key]]

      if previous_definition
        raise ParseError.new(
          code: Messages::Parser::DUPLICATE_REFERENCE_DEFINITION,
          meta: {
            key: instruction[:key],
            line_a: previous_definition[:line],
            line_b: instruction[:line]
          }
        )
      end

      @definitions[instruction[:key]] = instruction
    end

    def empty_line
      @instructions.push({
        line: @line_number,
        type: :empty_line
      })
    end

    def field(definition, key, value)
      instruction = {
        definition: !!definition,
        key: key,
        line: @line_number,
        type: :field,
        value: value
      }

      define(instruction) if definition
      @instructions.push(instruction)
    end

    def field_merge(key)
      @instructions.push({
        key: key,
        line: @line_number,
        type: :field_merge
      })
    end

    def key(definition, key)
      instruction = {
        definition: !!definition,
        key: key,
        line: @line_number,
        type: :key
      }

      @instructions.push(instruction)
      define(instruction) if definition
    end

    def list_item(value)
      @instructions.push({
        line: @line_number,
        type: :list_item,
        value: value
      })
    end

    def list_merge(key)
      @instructions.push({
        key: key,
        line: @line_number,
        type: :list_merge
      })
    end

    def map_merge(key)
      @instructions.push({
        key: key,
        line: @line_number,
        type: :map_merge
      })
    end

    def map_entry(key, value)
      @instructions.push({
        key: key,
        line: @line_number,
        type: :map_pair,
        value: value
      })
    end

    def next_line
      if @line_number < @lines.length
        @line_number += 1
        @line_content = @lines[@line_number - 1]

        return true
      end

      false
    end

    def section(definition, hashes, key)
      instruction = {
        definition: !!definition,
        depth: hashes.length,
        key: key,
        line: @line_number,
        type: :section
      }

      @instructions.push(instruction)
      define(instruction) if definition
    end

    def section_merge(key)
      @instructions.push({
        key: key,
        line: @line_number,
        type: :section_merge
      })
    end

    def verbatim_field(definition, dashes, key)
      terminator = Regexp.new("^\\s*(#{definition})\\s*(#{dashes})\\s*(#{Regexp.escape(key)})\\s*$")

      instruction = {
        children: [],
        definition: !!definition,
        key: key,
        line: @line_number,
        type: :verbatim_field
      }

      while next_line
        if (match = terminator.match(@line_content))
          instruction[:children].push({
            definition: definition,
            key: key,
            line: @line_number,
            type: :terminator
          })

          @instructions.push(instruction)
          define(instruction) if definition
          return
        end

        instruction[:children].push({
          value: @line_content,
          line: @line_number,
          type: :line
        })
      end

      raise ParseError.new(
        code: Messages::Parser::UNTERMINATED_BLOCK,
        meta: { key: key, begin_line: instruction[:line] }
      )
    end

    def run
      begin

        case
        when match = Patterns::EMPTY_LINE.match(@line_content)
          empty_line
        when match = Patterns::COMMENT.match(@line_content)
          comment(match[1])
        when match = Patterns::FIELD.match(@line_content)
          field(match[1], match[2], match[3])
        when match = Patterns::KEY.match(@line_content)
          key(match[1], match[2])
        when match = Patterns::LIST_ITEM.match(@line_content)
          list_item(match[1])
        when match = Patterns::MULTILINE_FIELD.match(@line_content)
          verbatim_field(match[1], match[2], match[3])
        when match = Patterns::APPEND_WITH_NEWLINE.match(@line_content)
          append_with_newline(match[1])
        when match = Patterns::APPEND_WITH_SPACE.match(@line_content)
          append_with_space(match[1])
        when match = Patterns::MAP_PAIR.match(@line_content)
          map_entry(match[1], match[2])
        when match = Patterns::ANY_KEY.match(@line_content)
          any_key(match[1], match[2])
        when match = Patterns::SECTION.match(@line_content)
          section(match[1], match[2], match[3])
        when match = Patterns::FIELD_MERGE.match(@line_content)
          field_merge(match[1])
        when match = Patterns::SECTION_MERGE.match(@line_content)
          section_merge(match[1])
        when match = Patterns::MAP_MERGE.match(@line_content)
          map_merge(match[1])
        when match = Patterns::LIST_MERGE.match(@line_content)
          list_merge(match[1])
        else
          raise ParseError.new(
            code: Messages::Parser::INVALID_LINE,
            meta: { line_number: @line_number }
          )
        end

      end while next_line

      {
        definitions: @definitions,
        instructions: @instructions
      }
    end
  end
end
