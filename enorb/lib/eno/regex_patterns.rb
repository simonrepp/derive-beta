module Eno
  module Patterns
    # == Any key
    ANY_KEY = /^\s*(\*)?\s*==(?!=)\s*(\S.*?)\s*$/

    # > Comment
    COMMENT = /^\s*>\s*(\S.*?)?\s*?$/

    #
    EMPTY_LINE = /^\s*$/

    # Key: Value
    FIELD = /^\s*(\*)?\s*(?![>\-#|\\*])([^\s<=:][^<=:]*?)\s*:\s*(\S.*?)\s*$/

    # Key < Reference
    FIELD_ASSIGNMENT = /^\s*(\*)?\s*(?![>\-#|\\*])([^\s<=:][^<=:]*?)\s*:\s*$/

    # < Field merge
    FIELD_MERGE = /^\s*<(?![#=\-])\s*(\S.*?)\s*$/

    # \ Append with space
    APPEND_WITH_SPACE = /^\s*\\\s*(.+?)?\s*$/

    # | Append with newline
    APPEND_WITH_NEWLINE = /^\s*\|\s*(.+?)?\s*$/

    # Key:
    KEY = /^\s*(\*)?\s*(?![>\-#|\\*])([^\s<=:][^<=:]*?)\s*:\s*$/

    # - List item
    LIST_ITEM = /^\s*-(?!-)\s*(.+?)?\s*$/

    # <- List merge
    LIST_MERGE = /^\s*<-\s*(\S.*?)\s*$/

    # <= Map merge
    MAP_MERGE = /^\s*<=\s*(\S.*?)\s*$/

    # Map = Pair
    MAP_PAIR = /^\s*(?![>\-#|\\*])([^\s<=:][^<=:]*?)\s*=\s*(.+?)?\s*$/

    # # Section
    SECTION = /^\s*(\*)?\s*(#+)\s*(\S.*?)\s*$/

    # < Section merge
    SECTION_MERGE = /^\s*<#\s*(\S.*?)\s*$/

    # -- Verbatim field
    MULTILINE_FIELD = /^\s*(\*)?\s*(-{2,})\s*(\S.*?)\s*$/
  end
end
