const markdownIt = require('markdown-it')({ html: true });
const markdownItFootnote = require('markdown-it-footnote');
const path = require('path');

markdownIt.use(markdownItFootnote);

// Override markdown-it-footnote render functions to include
// data-turbolinks="false" which prevents turbolinks to reload the page (and
// mess up scrolling therefore) instead of just letting the internal page scroll
// jump happen.
//
// Possibly there might be an upstream fix at some point (not likely soon though) - see https://github.com/turbolinks/turbolinks/issues/75
markdownIt.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
  var id      = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
  var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
  var refid   = id;

  if (tokens[idx].meta.subId > 0) {
    refid += ':' + tokens[idx].meta.subId;
  }

  return '<sup class="footnote-ref"><a href="#fn' + id + '" id="fnref' + refid + '" data-turbolinks="false">' + caption + '</a></sup>';
};

// See above
markdownIt.renderer.rules.footnote_anchor = (tokens, idx, options, env, slf) => {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  if (tokens[idx].meta.subId > 0) {
    id += ':' + tokens[idx].meta.subId;
  }

  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  return ' <a href="#fnref' + id + '" class="footnote-backref" data-turbolinks="false">\u21a9\uFE0E</a>';
};

markdownIt.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  const url = token.attrs[srcIndex][1];
  const caption = token.content;

  return `
    <div><img class="generic__image_restraint" src="${url}" alt="${caption}"></div>
    ${caption ? `<small>${caption}</small>` : ''}
  `.trim();
};

const renderMarkdown = markdown => {
  return markdownIt.render(markdown);
};

const embeddableMediaExtensions = ['.gif', '.GIF', '.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG'];

// TODO: Interpolate re-usable parts to form regexes
const htmlMediaRegex = /(src|href)\s*=\s*['"]\s*(?!https?:\/\/|\/\/)(\S(?:(?!src\s*=|href\s*=).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|mp3|MP3|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*['"]/g;
const markdownMediaRegex = /(!|)\[(?:(?!\[.*\]).)*\]\((?!https?:\/\/|\/\/)(\S(?:(?!\[.*\]).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|mp3|MP3|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*(?:\s+"(?:(?!".*"\)).)*")?\)/g;
// Pluggable, modulare regex components to build the md/html rules? - also think more in terms of inception matching (no src="" inside src="", no ![]() inside ![]() ..)
// match(/!\[((?!!\[.*\]\(.*\)).)*\]\(((?!!\[.*\]\(.*\)).)*\)/g); (possibly resuse to improve regexes later, missing ](https?: NEGATIVE LOOKAHEAD THINGY)

const validate = (value, mediaAllowed) => {
  if(value.trim().length === 0)
    return null;

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
        throw `Der Markdown Text enthält einen Embed der Datei "${urlMatch}", dessen Dateityp ist aber für Embeds nicht erlaubt.`;
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
      throw 'Interner Fehler bei der RegExp-basierten Detektion von referenzierten Mediendateien.';
    }
  };

  value = value.replace(markdownMediaRegex, validateEmbeddedMedia);
  value = value.replace(htmlMediaRegex, validateEmbeddedMedia);

  if(!mediaAllowed && (downloads.length > 0 || embeds.length > 0)) {
    throw `Der Markdown Text enhält Verweise auf Mediendateien, in diesem Feld ist das aber nicht erlaubt.`;
  }

  let html;
  try {
    html = renderMarkdown(value);
  } catch(err) {
    throw `Der Markdown Text hat beim konvertieren einen Fehler ausgelöst: ${err}`;
  }

  return {
    downloads: downloads,
    embeds: embeds,
    converted: html
  };
};

exports.markdown = value => validate(value, false);
exports.markdownWithMedia = value => validate(value, true);
exports.renderMarkdown = renderMarkdown;
