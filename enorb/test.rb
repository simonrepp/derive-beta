require_relative 'lib/eno.rb'

file = '/home/simon/derive/derive-beta/eno/latest-spec/baseline.eno'

input = File.read(file)

tokenizer = Eno::Tokenizer.new(input)
tokenizer.tokenize


# lexer = Eno::Lexer.new(input)
# lexed = lexer.run()
#
# # pp lexed
#
# instructions = Eno::solve(lexed)
#
# # pp instructions
#
# resolved = Eno::resolve(instructions)
#
# pp resolved.raw
