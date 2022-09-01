const markdownIt = require('markdown-it');
const markdownItFootnote = require('markdown-it-footnote');
const path = require('path');

const markdownItInstance = markdownIt({ html: true });

markdownItInstance.use(markdownItFootnote);

markdownItInstance.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');
    const url = token.attrs[srcIndex][1];
    const caption = token.content;

    return `
<div><img class="generic__image_restraint" src="${url}" alt="${caption}"></div>
${caption ? `<small>${caption}</small>` : ''}
    `.trim();
};

function renderMarkdown(markdown) {
    return markdownItInstance.render(markdown);
}
exports.renderMarkdown = renderMarkdown;

const EMBEDDABLE_MEDIA_EXTENSIONS = ['.gif', '.GIF', '.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG'];
const HTML_MEDIA_REGEXP = /(src|href)\s*=\s*['"]\s*(?!https?:\/\/|\/\/)(\S(?:(?!src\s*=|href\s*=).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|mp3|MP3|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*['"]/g;
const MARKDOWN_MEDIA_REGEXP = /(!|)\[(?:(?!\[.*\]).)*\]\((?!https?:\/\/|\/\/)(\S(?:(?!\[.*\]).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|mp3|MP3|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*(?:\s+"(?:(?!".*"\)).)*")?\)/g;

function validate(value, mediaAllowed) {
    if (/^\s*$/.test(value)) return null;

    const downloads = [];
    const embeds = [];

    let downloadNumber = 1;
    let embedNumber = 1;

    const validateEmbeddedMedia  = (fullMatch, typeMatch, urlMatch) => {
        const fileExtension = path.extname(urlMatch);
        const normalizedPath = urlMatch.replace(/^\//, '').normalize();

        if (typeMatch === '!' || typeMatch === 'src') {
            if (EMBEDDABLE_MEDIA_EXTENSIONS.includes(fileExtension)) {
                const embed = {
                    encodedURI: encodeURI(normalizedPath),
                    normalizedPath: normalizedPath,
                    placeholder: `EMBED_INTERMEDIATE_${embedNumber}`,
                    virtualFilename: `embed-${embedNumber}${fileExtension}`
                };

                embeds.push(embed);
                embedNumber++;

                return fullMatch.replace(urlMatch, embed.placeholder);
            } else {
                throw `Der Markdown Text enthält einen Embed der Datei "${urlMatch}", dessen Dateityp ist aber für Embeds nicht erlaubt.`;
            }
        } else if (typeMatch === '' || typeMatch === 'href') {
            const download = {
                encodedURI: encodeURI(normalizedPath),
                normalizedPath: normalizedPath,
                placeholder: `DOWNLOAD_INTERMEDIATE_${downloadNumber}`,
                virtualFilename: `download-${downloadNumber}${fileExtension}`
            };

            downloads.push(download);
            downloadNumber++;

            return fullMatch.replace(urlMatch, download.placeholder);
        } else {
            throw 'Interner Fehler bei der RegExp-basierten Detektion von referenzierten Mediendateien.';
        }
    };

    value = value.replace(MARKDOWN_MEDIA_REGEXP, validateEmbeddedMedia);
    value = value.replace(HTML_MEDIA_REGEXP, validateEmbeddedMedia);

    if (!mediaAllowed && (downloads.length > 0 || embeds.length > 0)) {
        throw `Der Markdown Text enhält Verweise auf Mediendateien, in diesem Feld ist das aber nicht erlaubt.`;
    }

    let html;
    try {
        html = renderMarkdown(value);
    } catch(err) {
        throw `Der Markdown Text hat beim konvertieren einen Fehler ausgelöst: ${err}`;
    }

    return {
        downloads,
        embeds,
        converted: html
    };
}

function markdown(value) {
    return validate(value, false);
}
exports.markdown = markdown;

function markdownWithMedia(value) {
    return validate(value, true);
}
exports.markdownWithMedia = markdownWithMedia;
