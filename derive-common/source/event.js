const { loadEno, statFile } = require('../util.js');
const { ValidationError, ParseError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.events.set(enoPath, cached.event);
  } else {
    let doc;

    try {
      doc = await loadEno(data.root, enoPath);
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ParseError) {
        data.warnings.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    const event = {
      draft: /\.entwurf\.eno$/.test(enoPath),
      sourceFile: enoPath
    };

    doc.allElementsRequired();

    try {
      event.title = doc.field('Titel').requiredStringValue();

      event.permalinkField = doc.field('Permalink');
      event.permalink = event.permalinkField.requiredPermalinkValue();

      event.subtitle = doc.field('Untertitel').optionalStringValue();
      event.url = doc.field('URL').optionalUrlValue();
      event.hostReferences = doc.list('Veranstalter').items().map(item => ({ item, name: item.requiredStringValue() }));
      event.participantReferences = doc.list('Teilnehmer').items().map(item => ({ item, name: item.requiredStringValue() }));
      event.categoriesDisconnected = doc.list('Kategorien').requiredStringValues();
      event.tagsDisconnected = doc.list('Tags').requiredStringValues();
      event.image = doc.field('Bild').optionalPathValue();
      event.urbanize = doc.field('Urbanize').optionalUrbanizeEditionValue();
      event.address = doc.field('Adresse').optionalStringValue();
      event.abstract = doc.field('Abstract').optionalMarkdownValue();
      event.additionalInfo = doc.field('Zusatzinfo').optionalMarkdownValue();
      event.text = doc.field('Text').optionalMarkdownWithMediaValue();

      event.dates = doc.sections('Termin').map(date => ({
        date: date.field('Datum').optionalDatetimeValue(), // TODO: Required ?
        time: date.field('Zeit').optionalStringValue() // TODO: Required ?
      }));

      doc.assertAllTouched();
    } catch(err) {
      data.cache.delete(enoPath);

      if(err instanceof ValidationError) {
        data.warnings.push({
          files: [{ path: enoPath, selection: err.selection }],
          message: err.text,
          snippet: err.snippet
        });

        return;
      } else {
        throw err;
      }
    }

    data.cache.set(enoPath, { event: event, stats: stats });
    data.events.set(enoPath, event);
  }
};
