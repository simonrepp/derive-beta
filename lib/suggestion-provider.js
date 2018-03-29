const path = require('path');

const { URBANIZE_ENUM } = require('../derive-common/validate.js');

class SuggestionProvider {
	constructor(data) {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '.text.plain, .toml';
		this.data = data;
	}

	getSuggestions(options) {
		const { prefix } = options;

		// only look for suggestions after 3 characters have been typed
		if(prefix.length > 1) {
			return this.findMatchingSuggestions(prefix);
		}
	}

	findMatchingSuggestions(prefix) {
		const prefixLower = prefix.toLowerCase();
		const matches = [];


		this.data.articles.forEach(article => {
			if(article.title.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: article.title,
					description: article.abstract || 'Kein Abstract',
					descriptionMoreURL: `https://staging.derive.fdpl.io/texte/${article.permalink}/`,
					iconHTML: '<i class="icon-file-text"></i>',
					type: 'value',
					leftLabel: 'Artikel'
				});
			}
		});

		this.data.books.forEach(book => {
			if(book.title.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: book.title,
					description: book.description || 'Kein Verlagstext',
					descriptionMoreURL: `https://staging.derive.fdpl.io/bücher/${book.permalink}/`,
					iconHTML: '<i class="icon-book"></i>',
					type: 'class',
					leftLabel: 'Buch'
				});
			}
		});

		this.data.media.forEach((touched, media) => {
			if(path.basename(media).startsWith(prefix)) {
				matches.push({
					text: media,
					description: touched ? null : 'Bisher ungenutzt',
					iconHTML: '<i class="icon-file-media"></i>',
					type: 'snippet',
					leftLabel: 'Mediendatei'
				});
			}
		});

		this.data.players.forEach(player => {
			if(player.name.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: player.name,
					description: player.biography || 'Keine Biographie',
					descriptionMoreURL: `https://staging.derive.fdpl.io/${player.publishedBooks ? 'verlage' : 'autoren'}/${player.permalink}/`,
					iconHTML: '<i class="icon-person"></i>',
					type: 'method',
					leftLabel: 'Akteur'
				});
			}
		});

		this.data.categories.forEach((categoryData, category) => {
			if(category.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: category,
					description: `${categoryData.referenceCount} Referenzierungen`,
					iconHTML: '<i class="icon-bookmark"></i>',
					type: 'property',
					leftLabel: 'Kategorie'
				});
			}
		});

		this.data.tags.forEach((tagData, tag) => {
			if(tag.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: tag,
					description:  `${tagData.referenceCount} Referenzierungen`,
					descriptionMoreURL: `https://staging.derive.fdpl.io/tag/${tag}/`,
					iconHTML: '<i class="icon-tag"></i>',
					type: 'variable',
					leftLabel: 'Tag'
				});
			}
		});

		URBANIZE_ENUM.forEach(urbanize => {
			if(urbanize.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: urbanize,
					description: `Urbanize Festival ${urbanize}`,
					iconHTML: '<i class="icon-megaphone"></i>',
					type: 'constant',
					leftLabel: 'Urbanize'
				});
			}
		})

		return matches;
	}
}

module.exports = SuggestionProvider;
