module Adventure
  class List
    def initialize(key)
      @key = key
      @items = []
    end

    def append(value)
      @items.push(value)
    end

    def raw
      @items
    end
  end
end
