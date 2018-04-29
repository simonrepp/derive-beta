require_relative 'lib/adventure.rb'

# file = '/home/simon/derive/derive-beta/plain/latest-spec/baseline.plain'
file = '/home/simon/derive/derive-beta/plain/latest-spec/sketchbook/complex.plain'
input = File.read(file)

lexer = Adventure::Lexer.new(input)
lexed = lexer.run()

# pp lexed

instructions = Adventure::solve(lexed)

# pp instructions

resolved = Adventure::resolve(instructions)

pp resolved.raw
