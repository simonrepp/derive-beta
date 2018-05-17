require 'benchmark'
require_relative 'lib/eno.rb'

# file = '/home/simon/derive/derive-beta/eno/latest-spec/baseline.eno'
# file = '/home/simon/derive/derive-beta/eno/latest-spec/sketchbook/complex.eno'
file = '/home/simon/derive/derive-beta/eno/latest-spec/extended.eno'

input = File.read(file)

tokenizer = Eno::Tokenizer.new(input)
pp tokenizer.tokenize
#
# lexer = Eno::Lexer.new(input)
# pp lexer.run()
#
#
# Benchmark.bm(10) do |x|
#   x.report('dp:')         { fib_dp(35) }
#   x.report('recursive:')  { fib_rec(35) }
# end

# n = 100000
#
# result = Benchmark.measure do
#   n.times do
#     tokenizer = Eno::Tokenizer.new(input)
#     tokenizer.tokenize
#   end
# end
#
# puts 'eno tokenizer'
# puts result
#
# result = Benchmark.measure do
#   n.times do
#     lexer = Eno::Lexer.new(input)
#     lexer.run
#   end
# end
#
# puts 'adventure lexer'
# puts result

# instructions = Eno::solve(lexed)
#
# # pp instructions
#
# resolved = Eno::resolve(instructions)
#
# pp resolved.raw
