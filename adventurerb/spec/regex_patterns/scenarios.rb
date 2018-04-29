require_relative '../../lib/adventure.rb'
require_relative './space.rb'

GROUPED_SCENARIOS = {

  ANY_KEY_SCENARIOS: [
    {
      captures: { 1 => nil, 2 => 'Any Key' },
      pattern: Adventure::Patterns::ANY_KEY,
      syntax: '== Any Key',
      variants: space('==', 'Any Key')
    },
    {
      captures: { 1 => '*', 2 => 'Any Key' },
      pattern: Adventure::Patterns::ANY_KEY,
      syntax: '* == Any Key',
      variants: space('*', '==', 'Any Key')
    },
    {
      captures: { 1 => nil, 2 => '==' },
      pattern: Adventure::Patterns::ANY_KEY,
      syntax: '== ==',
      variants: space('==', ' ', '==')
    },
    {
      captures: { 1 => '*', 2 => '==' },
      pattern: Adventure::Patterns::ANY_KEY,
      syntax: '* == ==',
      variants: space('*', '==', ' ', '==')
    }
  ],

  APPEND_WITH_SPACE_SCENARIOS: [
    {
      captures: { 1 => nil },
      pattern: Adventure::Patterns::APPEND_WITH_SPACE,
      syntax: '\\',
      variants: space('\\')
    },
    {
      captures: { 1 => 'Value' },
      pattern: Adventure::Patterns::APPEND_WITH_SPACE,
      syntax: '\\ Value',
      variants: space('\\', 'Value')
    },
    {
      captures: { 1 => '\\' },
      pattern: Adventure::Patterns::APPEND_WITH_SPACE,
      syntax: '\\ \\',
      variants: space('\\', '\\')
    }
  ],

  APPEND_WITH_NEWLINE_SCENARIOS: [
    {
      captures: { 1 => nil },
      pattern: Adventure::Patterns::APPEND_WITH_NEWLINE,
      syntax: '|',
      variants: space('|')
    },
    {
      captures: { 1 => 'Value' },
      pattern: Adventure::Patterns::APPEND_WITH_NEWLINE,
      syntax: '| Value',
      variants: space('|', 'Value')
    },
    {
      captures: { 1 => '|' },
      pattern: Adventure::Patterns::APPEND_WITH_NEWLINE,
      syntax: '| |',
      variants: space('|', '|')
    }
  ],

  COMMENT_SCENARIOS: [
    {
      captures: { 1 => 'Comment line' },
      pattern: Adventure::Patterns::COMMENT,
      syntax: '> Comment line',
      variants: space('>', 'Comment line')
    }
  ],

  EMPTY_LINE_SCENARIOS: [
    {
      captures: {},
      pattern: Adventure::Patterns::EMPTY_LINE,
      syntax: '',
      variants: space('')
    }
  ],

  FIELD_SCENARIOS: [
    {
      captures: { 1 => nil, 2 => 'Key', 3 => 'Value' },
      pattern: Adventure::Patterns::FIELD,
      syntax: 'Key: Value',
      variants: space('Key', ':', 'Value')
    },
    {
      captures: { 1 => '*', 2 => 'Key', 3 => 'Value' },
      pattern: Adventure::Patterns::FIELD,
      syntax: '* Key: Value',
      variants: space('*', 'Key', ':', 'Value')
    },
    {
      captures: { 1 => nil, 2 => 'The Key', 3 => 'The Value' },
      pattern: Adventure::Patterns::FIELD,
      syntax: 'The Key: The Value',
      variants: space('The Key', ':', 'The Value')
    },
    {
      captures: { 1 => '*', 2 => 'The Key', 3 => 'The Value' },
      pattern: Adventure::Patterns::FIELD,
      syntax: '* The Key: The Value',
      variants: space('*', 'The Key', ':', 'The Value')
    },
    {
      captures: { 1 => nil, 2 => 'Key', 3 => ':' },
      pattern: Adventure::Patterns::FIELD,
      syntax: 'Key: :',
      variants: space('Key', ':', ' ', ':')
    },
    {
      captures: { 1 => '*', 2 => 'Key', 3 => ':' },
      pattern: Adventure::Patterns::FIELD,
      syntax: '* Key: :',
      variants: space('*', 'Key', ':', ' ', ':')
    }
  ],

  FIELD_MERGE_SCENARIOS: [
    {
      captures: { 1 => 'Key' },
      pattern: Adventure::Patterns::FIELD_MERGE,
      syntax: '< Key',
      variants: space('<', 'Key')
    }
  ],

  KEY_SCENARIOS: [
    {
      captures: { 1 => nil, 2 => 'Key' },
      pattern: Adventure::Patterns::KEY,
      syntax: 'Key:',
      variants: space('Key', ':')
    },
    {
      captures: { 1 => '*', 2 => 'Key' },
      pattern: Adventure::Patterns::KEY,
      syntax: '* Key:',
      variants: space('*', 'Key', ':')
    },
    {
      captures: { 1 => nil, 2 => 'The Key' },
      pattern: Adventure::Patterns::KEY,
      syntax: 'The Key:',
      variants: space('The Key', ':')
    },
    {
      captures: { 1 => '*', 2 => 'The Key'},
      pattern: Adventure::Patterns::KEY,
      syntax: '* The Key:',
      variants: space('*', 'The Key', ':')
    }
  ],

  LIST_ITEM_SCENARIOS: [
    {
      captures: { 1 => nil },
      pattern: Adventure::Patterns::LIST_ITEM,
      syntax: '-',
      variants: space('-')
    },
    {
      captures: { 1 => 'Value' },
      pattern: Adventure::Patterns::LIST_ITEM,
      syntax: '- Value',
      variants: space('-', 'Value')
    },
    {
      captures: { 1 => 'The Value' },
      pattern: Adventure::Patterns::LIST_ITEM,
      syntax: '- The Value',
      variants: space('-', 'The Value')
    },
    {
      captures: { 1 => '-' },
      pattern: Adventure::Patterns::LIST_ITEM,
      syntax: '- -',
      variants: space('-', ' ', '-')
    }
  ],

  LIST_MERGE_SCENARIOS: [
    {
      captures: { 1 => 'Reference' },
      pattern: Adventure::Patterns::LIST_MERGE,
      syntax: '<- Reference',
      variants: space('<-', 'Reference')
    },
    {
      captures: { 1 => 'The Reference' },
      pattern: Adventure::Patterns::LIST_MERGE,
      syntax: '<- The Reference',
      variants: space('<-', 'The Reference')
    },
    {
      captures: { 1 => '<' },
      pattern: Adventure::Patterns::LIST_MERGE,
      syntax: '<- <',
      variants: space('<-', '<')
    },
    {
      captures: { 1 => '<-' },
      pattern: Adventure::Patterns::LIST_MERGE,
      syntax: '<- <-',
      variants: space('<-', '<-')
    },
  ],

  MAP_MERGE_SCENARIOS: [
    {
      captures: { 1 => 'Reference' },
      pattern: Adventure::Patterns::MAP_MERGE,
      syntax: '<= Reference',
      variants: space('<=', 'Reference')
    },
    {
      captures: { 1 => 'The Reference' },
      pattern: Adventure::Patterns::MAP_MERGE,
      syntax: '<= The Reference',
      variants: space('<=', 'The Reference')
    },
    {
      captures: { 1 => '<' },
      pattern: Adventure::Patterns::MAP_MERGE,
      syntax: '<= <',
      variants: space('<=', '<')
    },
    {
      captures: { 1 => '<=' },
      pattern: Adventure::Patterns::MAP_MERGE,
      syntax: '<= <=',
      variants: space('<=', '<=')
    },
  ],

  MAP_PAIR_SCENARIOS: [
    {
      captures: { 1 => 'Key', 2 => 'Value' },
      pattern: Adventure::Patterns::MAP_PAIR,
      syntax: 'Key = Value',
      variants: space('Key', '=', 'Value')
    },
    {
      captures: { 1 => 'The Key', 2 => 'The Value' },
      pattern: Adventure::Patterns::MAP_PAIR,
      syntax: 'The Key = The Value',
      variants: space('The Key', '=', 'The Value')
    },
    {
      captures: { 1 => 'Key', 2 => '=' },
      pattern: Adventure::Patterns::MAP_PAIR,
      syntax: 'Key = =',
      variants: space('Key', '=', ' ', '=')
    },
    {
      captures: { 1 => 'Key', 2 => ':' },
      pattern: Adventure::Patterns::MAP_PAIR,
      syntax: 'Key = :',
      variants: space('Key', '=', ' ', ':')
    }
  ],

  MULTILINE_FIELD_SCENARIOS: [
    {
      captures: { 1 => nil, 2 => '--', 3 => 'Key' },
      pattern: Adventure::Patterns::MULTILINE_FIELD,
      syntax: '-- Key',
      variants: space('--', 'Key')
    },
    {
      captures: { 1 => '*', 2 => '--', 3 => 'Key' },
      pattern: Adventure::Patterns::MULTILINE_FIELD,
      syntax: '* -- Key',
      variants: space('*', '--', 'Key')
    },
    {
      captures: { 1 => nil, 2 => '---', 3 => 'Key' },
      pattern: Adventure::Patterns::MULTILINE_FIELD,
      syntax: '--- Key',
      variants: space('---', 'Key')
    },
    {
      captures: { 1 => '*', 2 => '---', 3 => 'Key' },
      pattern: Adventure::Patterns::MULTILINE_FIELD,
      syntax: '* --- Key',
      variants: space('*', '---', 'Key')
    }
  ],

  SECTION_SCENARIOS: [
    {
      captures: { 1 => nil, 2 => '#', 3 => 'Key' },
      pattern: Adventure::Patterns::SECTION,
      syntax: '# Key',
      variants: space('#', 'Key')
    },
    {
      captures: { 1 => '*', 2 => '#', 3 => 'Key' },
      pattern: Adventure::Patterns::SECTION,
      syntax: '* # Key',
      variants: space('*', '#', 'Key')
    },
    {
      captures: { 1 => nil, 2 => '##', 3 => 'Key' },
      pattern: Adventure::Patterns::SECTION,
      syntax: '## Key',
      variants: space('##', 'Key')
    },
    {
      captures: { 1 => '*', 2 => '##', 3 => 'Key' },
      pattern: Adventure::Patterns::SECTION,
      syntax: '* ## Key',
      variants: space('*', '##', 'Key')
    }
  ],

  SECTION_MERGE_SCENARIOS: [
    {
      captures: { 1 => 'Reference' },
      pattern: Adventure::Patterns::SECTION_MERGE,
      syntax: '<# Reference',
      variants: space('<#', 'Reference')
    },
    {
      captures: { 1 => 'The Reference' },
      pattern: Adventure::Patterns::SECTION_MERGE,
      syntax: '<# The Reference',
      variants: space('<#', 'The Reference')
    },
    {
      captures: { 1 => '<' },
      pattern: Adventure::Patterns::SECTION_MERGE,
      syntax: '<# <',
      variants: space('<#', '<')
    },
    {
      captures: { 1 => '<#' },
      pattern: Adventure::Patterns::SECTION_MERGE,
      syntax: '<# <#',
      variants: space('<#', '<#')
    },
  ]

}

SCENARIOS = GROUPED_SCENARIOS.values.flatten
