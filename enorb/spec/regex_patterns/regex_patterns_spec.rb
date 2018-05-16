require_relative './scenarios.rb'

RSpec.describe Eno::Patterns do
  Eno::Patterns.constants.each do |constant|
    pattern = Eno::Patterns.const_get(constant)

    describe constant do
      SCENARIOS.each do |scenario|
        scenario[:variants].each do |variant|
          context "with line \"#{variant}\"" do
            match = pattern.match(variant)

            if scenario[:pattern] == pattern

              it 'matches' do
                expect(match).to be_truthy
              end

              scenario[:captures].each do |index, capture|
                it "captures group #{index} (#{capture}) correctly" do
                  expect(match[index]).to eq(capture)
                end
              end

            else

              it 'does not match' do
                expect(match).to be_falsy
              end

            end
          end
        end
      end
    end
  end
end
