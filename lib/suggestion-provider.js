const PlainDataValue = require('../plaindata/lib/value.js');
const { parse, PlainDataParseError } = require('../plaindata/plaindata.js');
const { URBANIZE_ENUM } = require('../derive-common/util.js');

class SuggestionProvider {
  constructor(data) {
    this.selector = '.source.plain, .text.plain';
    this.data = data;
  }

  getSuggestions(options) {
    const { bufferPosition, editor } = options;

    try {
      const document = parse(editor.getText(), 'de');

      const element = document.lookupIndex[bufferPosition.row + 1];

      if(element &&
         (element instanceof PlainDataValue) &&
         element.value &&
         element.value.length > 1) {
        return this.findMatchingSuggestions(element);
      }
    } catch(err) {
      if(err instanceof PlainDataParseError) {
        // ignore, or maybe show helpful suggestions to user :) (but would need to be debounced otherwise errorflood during typing)
      } else {
        throw(err);
      }
    }
  }

  findMatchingSuggestions(element) {
    const prefixLower = element.value.toLowerCase();
    const matches = [];

    if(element.parent && element.parent.key === 'Artikel' && element.key.match(/^Titel$/)) {
      this.data.articles.forEach(article => {
        if(article.title.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: article.title,
            description: article.abstract || 'Kein Abstract',
            descriptionMoreURL: `https://staging.derive.at/texte/${article.permalink}/`,
            iconHTML: '<i class="icon-file-text"></i>',
            type: 'value',
            leftLabel: 'Artikel'
          });
        }
      });
    }

    if(element.key.match(/^Buchbesprechungen$/)) {
      this.data.books.forEach(book => {
        if(book.title.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: book.title,
            description: book.description || 'Kein Verlagstext',
            descriptionMoreURL: `https://staging.derive.at/bücher/${book.permalink}/`,
            iconHTML: '<i class="icon-book"></i>',
            type: 'class',
            leftLabel: 'Buch'
          });
        }
      });
    }

    if(element.key.match(/^(Bild|Cover|Soundfile)$/)) {
      this.data.media.forEach((media, normalizedPath) => {
        if(normalizedPath.includes(prefixLower)) {
          matches.push({
            text: normalizedPath,
            description: media.used ? null : 'Bisher ungenutzt',
            iconHTML: '<i class="icon-file-media"></i>',
            type: 'snippet',
            leftLabel: 'Mediendatei'
          });
        }
      });
    }

    if(element.key.match(/^(Redaktion|Autoren\/Herausgeber|Verleger|Veranstalter|Teilnehmer)$/)) {
      this.data.players.forEach(player => {
        if(player.name.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: player.name,
            description: player.biography || 'Keine Biographie',
            descriptionMoreURL: `https://staging.derive.at/${player.publishedBooks ? 'verlage' : 'autoren'}/${player.permalink}/`,
            iconHTML: '<i class="icon-person"></i>',
            type: 'method',
            leftLabel: 'Akteur'
          });
        }
      });
    }

    if(element.key.match(/^Kategorien$/)) {
      this.data.categories.forEach(category => {
        if(category.name.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: category.name,
            description: `${category.referenceCount} Referenzierungen`,
            iconHTML: '<i class="icon-bookmark"></i>',
            type: 'property',
            leftLabel: 'Kategorie'
          });
        }
      });
    }

    if(element.key.match(/^Tags$/)) {
      this.data.tags.forEach(tag => {
        if(tag.name.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: tag.name,
            description:  `${tag.referenceCount} Referenzierungen`,
            descriptionMoreURL: `https://staging.derive.at/tag/${tag.permalink}/`,
            iconHTML: '<i class="icon-tag"></i>',
            type: 'variable',
            leftLabel: 'Tag'
          });
        }
      });
    }

    if(element.key.match(/^Urbanize$/)) {
      URBANIZE_ENUM.forEach(urbanize => {
        if(urbanize.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: urbanize,
            description: `Urbanize Festival ${urbanize}`,
            iconHTML: '<i class="icon-megaphone"></i>',
            type: 'constant',
            leftLabel: 'Urbanize'
          });
        }
      });
    }

    return matches;
  }
}

module.exports = SuggestionProvider;
