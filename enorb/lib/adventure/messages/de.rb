module Adventure
  module Messages
    DE = {
      Parser::DUPLICATE_REFERENCE_DEFINITION =>
        -> meta { "Two definitions for \"#{meta[:key]}\"! (in lines #{meta[:line_a]} and #{meta[:line_b]})" },
      Parser::UNTERMINATED_BLOCK =>
        -> meta { "Das mehrzeilige Feld \"#{meta[:key]}\" dass in Zeile #{meta[:begin_line]} beginnt wird bis zum Ende des Dokuments nicht beendet. (Eine abschliessende Zeile ident zu Zeile #{meta[:begin_line]} nach dem Textblock fehlt)" },
      Parser::NO_REFERENCE_DEFINITION =>
        -> meta { "Die Referenz \"#{meta[:key]}\" wird nirgendwo definiert" },
      Parser::MERGE_TYPE_MISMATCHES_DEFINITION_TYPE =>
        -> meta { "Die Definition von \"#{meta[:key]}\" hat einen anderen Typ, als der, der referenziert wird." },
      Parser::INVALID_LINE =>
        -> meta { "Die Zeile \"#{meta[:line_number]}\" folgt keinem spezifiziertem Muster." }
    }
  end
end
