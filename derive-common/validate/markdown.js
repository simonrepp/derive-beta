const path = require('path');

const { renderMarkdown } = require('../util.js'),
      ValidationError = require('./error.js');

const embeddableMediaExtensions = [
  '.tif', '.TIF', '.tiff', '.TIFF', '.gif', '.GIF', '.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG'
];

const htmlMediaRegex = /(src|href)\s*=\s*['"]\s*(?!https?:\/\/|\/\/)(\S(?:(?!src\s*=|href\s*=).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*['"]/g;
const markdownMediaRegex = /(!|)\[(?:(?!\[.*\]).)*\]\((?!https?:\/\/|\/\/)(\S(?:(?!\[.*\]).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*(?:\s+"(?:(?!".*"\)).)*")?\)/g;
// Pluggable, modulare regex components to build the md/html rules? - also think more in terms of inception matching (no src="" inside src="", no ![]() inside ![]() ..)
// match(/!\[((?!!\[.*\]\(.*\)).)*\]\(((?!!\[.*\]\(.*\)).)*\)/g); (possibly resuse to improve regexes later, missing ](https?: NEGATIVE LOOKAHEAD THINGY)

module.exports = (document, field, options = { media: false }) => {
  if(!document.hasOwnProperty(field)) {
    throw new ValidationError(`Fehlendes Feld "${field}" - Falls das Feld angegeben wurde eventuell nach Tippfehlern Ausschau halten und auch die Gross/Kleinschreibung beachten.`);
  }

  let markdown = document[field];

  if(markdown === null) {
    return null;
  } else if(typeof markdown === 'string') {

    const downloads = [];
    const embeds = [];

    let downloadNumber = 1;
    let embedNumber = 1;

    const validateEmbeddedMedia  = (fullMatch, typeMatch, urlMatch) => {
      const fileExtension = path.extname(urlMatch);
      const normalizedPath = urlMatch.replace(/^\//, '').normalize();

      if(typeMatch === '!' || typeMatch === 'src') {
        if(embeddableMediaExtensions.includes(fileExtension)) {
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
          throw new ValidationError(`Das Markdown-Feld "${field}" enthält einen Embed der Datei "${urlMatch}", dessen Dateityp ist aber für Embeds nicht erlaubt.`);
        }
      } else if(typeMatch === '' || typeMatch === 'href') {
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
        throw('Interner Fehler bei der RegExp-basierten Detektion von referenzierten Mediendateien.');
      }
    };

    markdown = markdown.replace(markdownMediaRegex, validateEmbeddedMedia);
    markdown = markdown.replace(htmlMediaRegex, validateEmbeddedMedia);

    if(!options.media && (downloads.length > 0 || embeds.length > 0)) {
      throw new ValidationError(`Das Markdown im Feld "${field}" enhält Verweise auf Mediendateien, in diesem Feld ist das aber nicht erlaubt.`);
    }

    let html;
    try {
      html = renderMarkdown(markdown);
    } catch(err) {
      throw new ValidationError(`Das Markdown im Feld "${field}" hat beim konvertieren einen Fehler ausgelöst: ${err}`);
    }

    return {
      downloads: downloads,
      embeds: embeds,
      sourced: html
    };

  } else {
    throw new ValidationError(`Das Feld "${field}" muss ein Textfeld sein, enthält aber einen anderen Datentyp.`);
  }
};
