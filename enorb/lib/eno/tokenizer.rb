module Eno
  class Tokenizer
    def initialize(context)
      @input = context[:input]
      @char = @input[0]
      @column = 1
      @line = 1
      @index = 0
      @instructions = []

      context[:instructions] = @instructions
    end

    def append
      if @char == '|'
        @instruction[:ranges] = { append_with_newline_operator: [@column, @column + 1] }
        @instruction[:separator] = "\n"
        @instruction[:type] = :field_append
      else
        @instruction[:ranges] = { append_with_space_operator: [@column, @column + 1] }
        @instruction[:separator] = ' '
        @instruction[:type] = :field_append
      end

      next!
      whitespace

      token = last_token

      if token
        @instruction[:ranges][:value] = token[:range]
        @instruction[:value] = token[:value]
      else
        @instruction[:value] = nil
      end
    end

    def block
      @instruction[:ranges] = { block_operator: [@column, @column + 1] }
      @instruction[:type] = :block

      @block_dashes = 1
      while next! == '-'
        @block_dashes += 1
        @instruction[:ranges][:block_operator][1] += 1
      end

      whitespace
      token = last_token

      if token
        @block_name = token[:value]
        @instruction[:ranges][:name] = token[:range]
        @instruction[:name] = token[:value]
      else
        raise 'ERROR'
      end

      @inside_block = true
    end

    def block_content
      begin_column = @column
      begin_index = @index

      return if block_terminator

      end_column = @column
      end_index = @index

      while @char != "\n"
        end_column = @column
        end_index = @index
        next!
      end

      @instruction[:ranges] = { content: [begin_column, end_column] }
      @instruction[:type] = :block_content
      @instruction[:value] = @input[begin_index..end_index]
    end

    def block_terminator
      whitespace
      dashes_begin = @column

      (1..@block_dashes).each do
        return false if @char != '-'
        next!
      end

      whitespace
      name_begin = @column

      @block_name.each_char do |char|
        return false if @char != char
        next!
      end

      whitespace

      return false if @char && @char != "\n"

      @instruction[:type] = :block_terminator
      @instruction[:ranges] = {
        block_operator: [dashes_begin, dashes_begin + @block_dashes],
        name: [name_begin, name_begin + @block_name.length]
      }

      @inside_block = false

      return true
    end

    def comment
      @instruction[:ranges] = { comment_operator: [@column, @column + 1] }
      @instruction[:type] = :comment

      next!
      whitespace
      token = last_token

      if token
        @instruction[:ranges][:text] = token[:range]
        @instruction[:text] = token[:value]
      end
    end

    def empty
      @instruction[:type] = :empty
    end

    def terminate_escape
      (1..@escape_backticks).each do
        return false if @char != '`'
        next!
      end

      @instruction[:ranges][:escape_end_operator] = [@column - @escape_backticks, @column]

      return true
    end

    def escaped_name
      @instruction[:ranges] = { escape_begin_operator: [@column, @column + 1]}

      @escape_backticks = 1
      while next! == '`'
        @escape_backticks += 1
        @instruction[:ranges][:escape_begin_operator][1] += 1
      end

      begin_column = @column
      begin_index = @index
      end_column = @column
      end_index = @index

      loop do
        break if terminate_escape
        raise 'ERROR' if @char == "\n" || @char == nil
        end_column = @column
        end_index = @index
        next!
      end

      @instruction[:name] = @input[begin_index..end_index]
      @instruction[:ranges][:name] = [begin_column, end_column]

      whitespace

      case @char
      when ":"
        @instruction[:ranges][:name_operator] = [@column, @column + 1]

        next!
        whitespace

        if @char == "\n"
          @instruction[:type] = :name
        else
          field
        end
      when "="
        @instruction[:ranges][:entry_operator] = [@column, @column + 1]
        @instruction[:type] = :dictionary_entry

        next!
        whitespace

        if @char == "\n"
          @instruction[:value] = nil
        else
          token = last_token

          @instruction[:ranges][:value] = token[:range]
          @instruction[:value] = token[:value]
        end
      when "<"
        @instruction[:ranges][:copy_operator] = [@column, @column + 1]

        next!
        whitespace
        token = last_token

        if token
          @instruction[:ranges][:template] = token[:range]
          @instruction[:template] = token[:value]
        else
          raise 'ERROR'
        end
      else
        raise 'ERROR'
      end

      next! while @char != "\n"
    end

    def field
      token = last_token

      if token
        @instruction[:ranges][:value] = token[:range]
        @instruction[:value] = token[:value]
        @instruction[:type] = :field
      end
    end

    def last_token
      whitespace

      begin_column = @column
      begin_index = @index
      end_column = @column
      end_index = @index

      begin
        break if @char == "\n"
        if @char != ' '
          end_column = @column
          end_index = @index
        end
      end while next!

      if begin_index == end_index
        nil
      else
        {
          range: [begin_column, end_column],
          value: @input[begin_index..end_index]
        }
      end
    end

    def list_item
      @instruction[:ranges] = { item_operator: [@column, @column + 1] }
      @instruction[:type] = :list_item

      next!
      token = last_token

      if token
        @instruction[:ranges][:value] = token[:range]
        @instruction[:value] = token[:value]
      end
    end

    def name
      begin_column = @column
      begin_index = @index
      end_column = @column
      end_index = @index

      begin
        break if @char == "<"
        break if @char == ":"
        break if @char == "="
        raise 'ERROR' if @char == "\n"
        if @char != ' '
          end_column = @column
          end_index = @index
        end
      end while next!

      @instruction[:name] = @input[begin_index..end_index]
      @instruction[:ranges] = { name: [begin_column, end_column] }

      case @char
      when ":"
        @instruction[:ranges][:name_operator] = [@column, @column + 1]

        next!
        whitespace

        if @char == "\n"
          @instruction[:type] = :name
        else
          field
        end
      when "="
        @instruction[:type] = :dictionary_entry
        @instruction[:ranges][:entry_operator] = [@column, @column + 1]

        next!
        whitespace

        if @char == "\n"
          @instruction[:value] = nil
        else
          token = last_token
          @instruction[:value] = token[:value]
          @instruction[:ranges][:value] = token[:range]
        end
      when "<"
        @instruction[:ranges][:copy_operator] = [@column, @column + 1]

        next!
        whitespace
        token = last_token

        if token
          @instruction[:ranges][:template] = token[:range]
          @instruction[:template] = token[:value]
        else
          raise 'ERROR'
        end
      end

      next! while @char != "\n"
    end

    def next!
      if @char == "\n"
        @column = 1
        @line += 1
      else
        @column += 1
      end

      @index += 1
      @char = @input[@index]

      # putc @char if @char
    end

    def section
      @instruction[:depth] = 1
      @instruction[:ranges] = { section_operator: [@column, @column + 1] }
      @instruction[:type] = :section

      while next! == '#'
        @instruction[:depth] += 1
        @instruction[:ranges][:section_operator][1] += 1
      end

      whitespace

      # TODO: section copy implementation

      case @char
      when "\n" then raise 'ERROR'
      when '`' then escaped_name
      else
        token = last_token

        @instruction[:name] = token[:value]
        @instruction[:ranges][:name] = token[:range]
      end
    end

    def tokenize
      begin
        # TODO: Store begin/end index and/or copy line content into instruction
        @instruction = { line: @line }
        @instructions.push(@instruction)

        whitespace

        if @inside_block
          block_content
          next
        end

        case @char
        when "\n" then empty
        when '>' then comment
        when '`' then escaped_name
        when '-'
          if @input[@index + 1] == '-'
            block
          else
            list_item
          end
        when '#' then section
        when '|' then append
        when '\\' then append
        else
          name
        end
      end while next!

      return @instructions
    end

    def whitespace
      next! while @char == ' '
    end
  end
end
