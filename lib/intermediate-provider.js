'use babel';

class IntermediateProvider {
	constructor(data) {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '.text.plain, .toml';
		this.data = data;
	}

	getSuggestions(options) {
		const { prefix } = options;

		// only look for suggestions after 3 characters have been typed
		if (prefix.length >= 3) {
			return this.findMatchingSuggestions(prefix);
		}
	}

	findMatchingSuggestions(prefix) {
		// filter list of suggestions to those matching the prefix, case insensitive
		let prefixLower = prefix.toLowerCase();

		let matches = [];

		matches = matches.concat(this.data.suggestions.articles.filter(article => {
			let textLower = article.text.toLowerCase();
			return textLower.startsWith(prefixLower);
		}).map(article => ({
			text: article.text,
			description: article.description,
			descriptionMoreURL: article.url,
			iconHTML: '<i class="icon-file-text" style="color: cyan;"></i>',
			type: 'value',
			leftLabel: 'Text'
		})));

		matches = matches.concat(this.data.suggestions.players.filter(player => {
			let textLower = player.text.toLowerCase();
			return textLower.startsWith(prefixLower);
		}).map(player => ({
			text: player.text,
			description: player.description,
			descriptionMoreURL: player.url,
			iconHTML: '<i class="icon-person" style="color: pink;"></i>',
			type: 'value',
			leftLabel: 'Akteur'
		})));

		matches = matches.concat(this.data.suggestions.tags.filter(tag => {
			let textLower = tag.text.toLowerCase();
			return textLower.startsWith(prefixLower);
		}).map(tag => ({
			text: tag.text,
			description: tag.description,
			descriptionMoreURL: tag.url,
			iconHTML: '<i class="icon-tag" style="color: yellow;"></i>',
			type: 'value',
			leftLabel: 'Tag'
		})));

		return matches;
	}
}
export default IntermediateProvider;
