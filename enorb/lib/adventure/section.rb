module Adventure
  class Section
    attr_accessor :associative_elements

    def initialize(key)
      @key = key

      @associative_elements = {}
      @sequential_elements = []
    end

    def append(key, value)
      if existing_associative = @associative_elements[key]
        # TODO: Existing merged fields get overwritten !?
        existing_associative.push(value)
      else
        @associative_elements[key] = [value]
      end

      @sequential_elements.push(value)
    end

    def merge(section)
      section.associative_elements.each do |key, elements|
        if existing_associative = @associative_elements[key]
          raise ParseError.new("A merged in section's elements may not overwrite explicitly created existing elements, consider reordering the merge instruction to the top of the section")
          # TODO: Unless those elements were merged themselves !
        else
          @associative_elements[key] = elements
          @sequential_elements.concat(elements)
        end
      end
    end

    def raw
      raw = {}

      @associative_elements.each do |key, elements|
        raw[key] = elements.map(&:raw)
      end

      # TODO: Here and elsewhere for debugging :)
      raw
    end
  end
end
