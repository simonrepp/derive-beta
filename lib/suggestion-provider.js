const enolib = require('enolib');
const { ParseError } = require('enolib');

class SuggestionProvider {
  constructor(data) {
    this.selector = '.text.eno';
    this.data = data;
  }

  articleSuggestions(filter) {
    return Array.from(this.data.articles.values())
                .filter(article => article.title.match(filter))
                .map(article => ({
                  text: article.title,
                  description: article.abstract || 'Kein Abstract',
                  descriptionMoreURL: `https://staging.derive.at/texte/${article.permalink}/`,
                  iconHTML: '<i class="icon-file-text"></i>',
                  type: 'value',
                  leftLabel: 'Artikel'
                }));
  }

  audioMediaSuggestions(filter) {
    return Array.from(this.data.media)
                .filter(([normalizedPath, media]) => normalizedPath.match(filter) && normalizedPath.match(/\.(aac|mp3|ogg)$/i))
                .map(([normalizedPath, media]) => ({
                   text: normalizedPath,
                   description: media.used ? null : 'Bisher ungenutzt',
                   iconHTML: '<i class="icon-file-media"></i>',
                   type: 'snippet',
                   leftLabel: 'Audiodatei'
                 }));
  }

  bookSuggestions(filter) {
    return Array.from(this.data.books.values())
                .filter(book => book.title.match(filter))
                .map(book => ({
                  text: book.title,
                  description: book.description || 'Kein Verlagstext',
                  descriptionMoreURL: `https://staging.derive.at/buecher/${book.permalink}/`,
                  iconHTML: '<i class="icon-book"></i>',
                  type: 'class',
                  leftLabel: 'Buch'
                }));
  }

  categorySuggestions(filter) {
    return Array.from(this.data.categories.values())
                .filter(category => category.name.match(filter))
                .map(category => ({
                  text: category.name,
                  description: `${category.referenceCount} Referenzierungen`,
                  iconHTML: '<i class="icon-bookmark"></i>',
                  type: 'property',
                  leftLabel: 'Kategorie'
                }));
  }

  getSuggestions(options) {
    const { bufferPosition, editor } = options;

    try {
      const { element, range } = enolib.lookup({ column: bufferPosition.column, line: bufferPosition.row }, editor.getText());

      if(range !== 'value')
        return null;

      if(element.yieldsField()) {
        const field = element.toField();
        const key = field.stringKey();
        const value = field.optionalStringValue();

        if(value === null || value.length < 2)
          return null;

        const filter = new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');

        if(key === 'Titel' && field.parent().stringKey() === 'Artikel')
          return this.articleSuggestions(filter);

        if(key.match(/^(Bild|Cover)$/))
          return this.imageMediaSuggestions(filter);

        if(key === 'Soundfile')
          return this.audioMediaSuggestions(filter);

      } else if(element.yieldsListItem()) {
        const item = element.toListItem();
        const key = item.parent().stringKey();
        const value = item.optionalStringValue();

        if(value === null || value.length < 2)
          return null;

        const filter = new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');

        if(key === 'Buchbesprechungen')
          return this.bookSuggestions(filter);

        if(key.match(/^(Autoren|Redaktion|Autoren\/Herausgeber|Verleger|Veranstalter|Teilnehmer)$/))
          return this.playerSuggestions(filter);

        if(key === 'Kategorien')
          return this.categorySuggestions(filter);

        if(key === 'Tags')
          return this.tagSuggestions(filter);
      }
    } catch(error) {
      if(!(error instanceof ParseError))
        throw error;

      return null;
    }
  }

  imageMediaSuggestions(filter) {
    return Array.from(this.data.media)
                .filter(([normalizedPath, media]) => normalizedPath.match(filter) && normalizedPath.match(/\.(gif|jpg|jpeg|png)$/i))
                .map(([normalizedPath, media]) => ({
                   text: normalizedPath,
                   description: media.used ? null : 'Bisher ungenutzt',
                   iconHTML: '<i class="icon-file-media"></i>',
                   type: 'snippet',
                   leftLabel: 'Bilddatei'
                 }));
  }

  playerSuggestions(filter) {
    return Array.from(this.data.players.values())
                .filter(player => player.name.match(filter))
                .map(player => ({
                  text: player.name,
                  description: player.biography || 'Keine Biographie',
                  descriptionMoreURL: `https://staging.derive.at/${player.publishedBooks ? 'verlage' : 'autoren'}/${player.permalink}/`,
                  iconHTML: '<i class="icon-person"></i>',
                  type: 'method',
                  leftLabel: 'Akteur'
                }));
  }

  tagSuggestions(filter) {
    return Array.from(this.data.tags.values())
                .filter(tag => tag.name.match(filter))
                .map(tag => ({
                  text: tag.name,
                  description:  `${tag.referenceCount} Referenzierungen`,
                  descriptionMoreURL: `https://staging.derive.at/tag/${tag.permalink}/`,
                  iconHTML: '<i class="icon-tag"></i>',
                  type: 'variable',
                  leftLabel: 'Tag'
                }));
  }
}

module.exports = SuggestionProvider;
