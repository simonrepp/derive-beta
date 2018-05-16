module Eno
  class Tokenizer
    def initialize(input)
      @input = input
      @char = input[0]
      @column = 1
      @line = 1
      @index = 0
      @instructions = []
    end

    def block
      instruction = {
        line: @line,
        ranges: {
          block_operator: [@column, @column + 1]
        },
        type: :block
      }

      while next! == '-'
        instruction[:ranges][:block_operator][1] += 1
      end

      whitespace

      token = last_token

      if token
        instruction[:ranges][:name] = token[:range]
        instruction[:name] = token[:value]
      else
        ERROR
      end

      @instructions << instruction

      next!

      # while !terminator_line read content line instruction

      # read terminator instruction
    end

    def comment
      instruction = {
        line: @line,
        ranges: {
          comment_operator: [@column, @column + 1]
        },
        type: :comment
      }

      next!

      whitespace

      token = last_token

      if token
        instruction[:ranges][:text] = token[:range]
        instruction[:text] = token[:value]
      end

      @instructions << instruction
    end

    def empty
      @instructions << {
        line: @line,
        type: :empty
      }
    end

    def field
      next! while @char != "\n"
    end

    def last_token
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
      next! while @char != "\n"
    end

    def name
      instruction = {
        ranges: {}
      }

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

      case @char
      when ":"
        instruction[:ranges][:name] = [begin_column, end_column]
        instruction[:ranges][:name_operator] = [@column, @column + 1]

        whitespace

        if @char == "\n"
          instruction[:type] = :name
        else
          field
        end
      when "="
        instruction[:ranges][:name] = [begin_column, end_column]
        instruction[:ranges][:entry_operator] = [@column, @column + 1]

        whitespace

        if @char == "\n"
          instruction[:type] = :name
        else
          field
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

      putc @input[@index] unless @input[@index] == nil

      @char = @input[@index]
    end

    def section
      instruction = {
        depth: 1,
        line: @line,
        ranges: {
          section_operator: [@column, @column + 1]
        },
        type: :section
      }

      while next! == '#'
        instruction[:depth] += 1
        instruction[:ranges][:section_operator][1] += 1
      end

      whitespace

      case @char
      when "\n"
        raise 'ERROR'
      when '`'
        escaped_name
      else
        token = last_token

        instruction[:name] = token[:value]
        instruction[:ranges][:name] = token[:range]
      end

      @instructions << instruction
    end

    def tokenize
      begin
        whitespace

        case @char
        when "\n"
          empty
        when '>'
          comment
        when '`'
          escaped_name
        when '#'
          section
        when '-'
          if @input[@index + 1] == '-'
            block
          else
            list_item
          end
        else
          name
        end
      end while next!

      puts @instructions
    end

    def whitespace
      next! while @char == ' '
    end
  end
end
