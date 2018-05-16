module Eno
  class ParseError < StandardError
    def initialize(code: nil, message: nil, meta: nil)
      @message = Messages::DE[code].call(meta)
      super(@message)
    end
  end

  class ValidationError < StandardError
    def initialize(code: nil, message: nil, meta: nil)
      @message = Messages::DE[code].call(meta)
      super(@message)
    end
  end

  # class MyError < StandardError
  #   attr_reader :thing
  #   def initialize(msg="My default message", thing="apple")
  #     @thing = thing
  #     super(msg)
  #   end
  # end
  #
  # begin
  #   raise MyError.new("my message", "my thing")
  # rescue => e
  #   puts e.thing # "my thing"
  # end
end
