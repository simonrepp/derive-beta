class SuggestionProvider {
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

		this.data.articles.forEach(article => {
			if(article.title.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: article.title,
					description: 'TODO article.description',
					descriptionMoreURL: 'TODO article.url',
					iconHTML: '<i class="icon-file-text" style="color: #fff;"></i>',
					type: 'value',
					leftLabel: 'Text'
				});
			}
		});

		this.data.media.forEach((_true, media) => {
			if(media.startsWith(prefix)) {
				matches.push({
					text: media,
					description: 'TODO media',
					descriptionMoreURL: 'TODO media.url',
					iconHTML: '<i class="icon-file-media" style="color: #fff;"></i>',
					type: 'value',
					leftLabel: 'Text'
				});
			}
		});

		this.data.players.forEach(player => {
			if(player.name.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: player.name,
					description: 'TODO player.description',
					descriptionMoreURL: 'TODO player.url',
					iconHTML: '<i class="icon-person" style="color: #fff;"></i>',
					type: 'value',
					leftLabel: 'Akteur'
				});
			}
		});

		Object.keys(this.data.tags).forEach(tag => {
			if(tag.toLowerCase().startsWith(prefixLower)) {
				matches.push({
					text: tag,
					description: 'TODO tag.description',
					descriptionMoreURL: 'TODO tag.url',
					iconHTML: '<i class="icon-tag" style="color: #fff;"></i>',
					type: 'value',
					leftLabel: 'Tag'
				});
			}
		});

		return matches;
	}
}

module.exports = SuggestionProvider;
