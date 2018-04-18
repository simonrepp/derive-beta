const path = require('path');

const { PlainDataParseError } = require('../plaindata/errors.js');
const { parse } = require('../plaindata/plaindata.js');
const { URBANIZE_ENUM } = require('../derive-common/util.js');

class SuggestionProvider {
  constructor(data) {
    this.selector = '.source.plain, .text.plain';
    this.data = data;
  }

  getSuggestions(options) {
    const { bufferPosition, editor, prefix } = options;

    try {
      const document = parse(editor.getText(), { locale: 'de' });

      const lookup = document.lookupIndex[bufferPosition.row + 1];

      if(lookup && lookup.value && lookup.value.length > 1) {
        return this.findMatchingSuggestions(prefix, lookup.key, lookup.value);
      }
    } catch(err) {
      if(err instanceof PlainDataParseError) {
        // ignore, or maybe show helpful suggestions to user :)
      } else {
        throw(err);
      }
    }
  }

  findMatchingSuggestions(prefix, key, value) {
    // const prefixLower = prefix.toLowerCase();
    const prefixLower = value.toLowerCase();
    const matches = [];

    // TODO: This should only match if it's in a RUBRIK -> ARTIKEL -> TITEL
    if(key.match(/^Titel$/)) {
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

    if(key.match(/^Buchbesprechungen$/)) {
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

    if(key.match(/^(Bild|Cover|Soundfile)$/)) {
      this.data.media.forEach((media, normalizedPath) => {
        if(normalizedPath.includes(prefix)) {
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

    if(key.match(/^(Redaktion|Autoren\/Herausgeber|Verleger|Veranstalter|Teilnehmer)$/)) {
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

    if(key.match(/^Kategorien$/)) {
      this.data.categories.forEach((categoryData, category) => {
        if(categoryData.name.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: categoryData.name,
            description: `${categoryData.referenceCount} Referenzierungen`,
            iconHTML: '<i class="icon-bookmark"></i>',
            type: 'property',
            leftLabel: 'Kategorie'
          });
        }
      });
    }

    if(key.match(/^Tags$/)) {
      this.data.tags.forEach((tagData, tag) => {
        if(tagData.name.toLowerCase().includes(prefixLower)) {
          matches.push({
            text: tagData.name,
            description:  `${tagData.referenceCount} Referenzierungen`,
            descriptionMoreURL: `https://staging.derive.at/tag/${tag}/`,
            iconHTML: '<i class="icon-tag"></i>',
            type: 'variable',
            leftLabel: 'Tag'
          });
        }
      });
    }

    if(key.match(/^Urbanize$/)) {
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
