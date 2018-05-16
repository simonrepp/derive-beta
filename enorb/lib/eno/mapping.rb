module Eno
  class Mapping
    def initialize(key)
      @key = key
      @attributes = {}
    end

    def append(key, value)
      if existing_attribute = @attributes[key]
        raise ParseError.new("ERRORAH")
      else
        @attributes[key] = value
      end
    end

    def raw
      @attributes
    end
  end
end
