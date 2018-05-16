require_relative 'lib/adventure.rb'
require_relative 'lib/eno.rb'

file = '/home/simon/derive/derive-beta/eno/latest-spec/baseline.eno'

input = File.read(file)

tokenizer = Eno::Tokenizer.new(input)
tokenizer.tokenize


# lexer = Adventure::Lexer.new(input)
# lexed = lexer.run()
#
# # pp lexed
#
# instructions = Adventure::solve(lexed)
#
# # pp instructions
#
# resolved = Adventure::resolve(instructions)
#
# pp resolved.raw
