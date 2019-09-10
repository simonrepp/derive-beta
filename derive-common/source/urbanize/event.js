const { loadEno, statFile } = require('../../util.js');
const { ParseError, ValidationError } = require('enolib');

module.exports = async (data, enoPath) => {
  const cached = data.cache.get(enoPath);
  const stats = await statFile(data.root, enoPath);

  if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
    data.urbanize.events[enoPath] = cached.event;
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

    const event = { sourceFile: enoPath };

    if(/\.entwurf\.eno$/.test(enoPath)) {
      event.draft = true;
    }

    doc.allElementsRequired();

    try {
      event.title = doc.field('Titel').requiredStringValue();

      event.permalinkField = doc.field('Permalink');
      event.permalink = event.permalinkField.requiredPermalinkValue();

      event.subtitle = doc.field('Untertitel').optionalStringValue();
      event.url = doc.field('Externer Link').optionalUrlValue();
      event.participantReferences = doc.list('Beteiligte').items().map(item => ({ item, name: item.requiredStringValue() }));
      event.category = doc.field('Kategorie').requiredUrbanizeCategoryValue();
      event.image = doc.field('Bild').optionalPathValue();
      event.imageCredits = doc.field('Bilduntertitel').optionalStringValue();
      event.venue = doc.field('Venue').requiredStringValue();
      event.address = doc.field('Adresse').requiredStringValue();
      event.directions = doc.field('Anfahrt').optionalMarkdownValue();
      event.abstract = doc.field('Abstract').requiredMarkdownValue();
      event.text = doc.field('Beschreibung (Markdown)').requiredMarkdownWithMediaValue();
      event.isStadtlabor = doc.field('Stadtlabor').requiredBooleanValue();
      event.additionalInfo = doc.field('Zusatzinfo').optionalMarkdownValue();
      event.language = doc.field('Sprache').requiredUrbanizeLanguageValue();

      event.dates = doc.sections('Termin').map(date => ({
        date: date.field('Datum').requiredDatetimeValue(),
        time: date.field('Zeit').requiredStringValue()
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
    data.urbanize.events[enoPath] = event;
  }
};
