module Eno
  class Field
    def initialize(key, value = nil)
      @key = key
      @value = value
    end

    def append(value, separator)
      if @value
        if separator == :space
          @value += " #{value}"
        elsif separator == :newline
          @value += "\n#{value}"
        end
      else
        @value = value
      end
    end

    def raw
      @value
    end
  end
end
