const path = require('path');

const { renderMarkdown } = require('../derive-common/loaders/markdown.js');

const htmlMediaRegex = /(src|href)\s*=\s*['"]\s*(?!https?:\/\/|\/\/)(\S(?:(?!src\s*=|href\s*=).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*['"]/g;
const markdownMediaRegex = /(!|)\[(?:(?!\[.*\]).)*\]\((?!https?:\/\/|\/\/)(\S(?:(?!\[.*\]).)*\.(?:doc|DOC|gif|GIF|jpeg|JPEG|jpg|JPG|pdf|PDF|png|PNG|tif|TIF|tiff|TIFF))\s*(?:\s+"(?:(?!".*"\)).)*")?\)/g;
// Pluggable, modulare regex components to build the md/html rules? - also think more in terms of inception matching (no src="" inside src="", no ![]() inside ![]() ..)
// match(/!\[((?!!\[.*\]\(.*\)).)*\]\(((?!!\[.*\]\(.*\)).)*\)/g); (possibly resuse to improve regexes later, missing ](https?: NEGATIVE LOOKAHEAD THINGY)

exports.convert = (data, markdown) => {
  const convertEmbeddedMedia  = (fullMatch, typeMatch, urlMatch) => {
    const normalizedPath = urlMatch.replace(/^\//, '').normalize();

    if(typeMatch === '!' || typeMatch === 'src' ||
       typeMatch === '' || typeMatch === 'href') {
      const media = data && data.media ? data.media.get(normalizedPath) : null;
      const localPath = media ? media.localFilesystemPath : null;
      const replacedPath = path.join(data.root, localPath || normalizedPath);

      return fullMatch.replace(urlMatch, encodeURI(replacedPath));
    } else {
      throw 'Interner Fehler bei der RegExp-basierten Detektion von referenzierten Mediendateien.';
    }
  };

  markdown = markdown.replace(markdownMediaRegex, convertEmbeddedMedia);
  markdown = markdown.replace(htmlMediaRegex, convertEmbeddedMedia);

  let html;
  try {
    html = renderMarkdown(markdown);
  } catch(err) {
    throw `Das Markdown hat beim konvertieren einen Fehler ausgelöst: ${err}`;
  }

  return html;
};
