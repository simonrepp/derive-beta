module Eno
  def self.parse(input, locale = 'en')
    context = {
      input: input,
      locale: locale
    }

    tokenizer = Tokenizer.new(context)
    tokenizer.tokenize

    analyze(context)

    pp context[:document_instruction]
  end
end
