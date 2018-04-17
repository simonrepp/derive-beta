module.exports = data => {
  data.categories.forEach(category => {
    if(category.spellings.size > 1) {
      data.warnings.push({
        description: 'Dies ist nur ein Hinweis, ansonsten bestehen keine Auswirkungen.',
        message: `**Verschiedene Schreibweisen einer Kategorie**\n\nFür eine Kategorie wurden mehrere Schreibweisen gefunden: ${[...category.spellings].map(spelling => `"${spelling}"`).join(', ')}. Dies sollte manuell (mit Hilfe der Volltextsuche) korrigiert werden.`
      });
    }
  });

  data.tags.forEach(tag => {
    if(tag.spellings.size > 1) {
      data.warnings.push({
        description: 'Dies ist nur ein Hinweis, ansonsten bestehen keine Auswirkungen.',
        message: `**Verschiedene Schreibweisen eines Tags**\n\nFür einen Tag wurden mehrere Schreibweisen gefunden: ${[...tag.spellings].map(spelling => `"${spelling}"`).join(', ')}. Dies sollte manuell (mit Hilfe der Volltextsuche) korrigiert werden.`
      });
    }
  });

  data.media.forEach(media => {
    if(!media.used) {
      data.warnings.push({
        description: 'Dies ist nur ein Hinweis, ansonsten bestehen keine Auswirkungen.',
        files: [{ path: media.localFilesystemPath }],
        message: `**Ungenützte Mediendatei**\n\nDie Mediendatei ${media.localFilesystemPath} wird in keinerlei Texten oder Dateifeldern genutzt - dies kann ein Hinweis darauf sein, dass der Pfad zu der Datei in einem Markdown oder Dateifeld inkorrekt ist. Falls ein Plain Data Dokument dass in einem seiner Datenfelder die Mediendatei referenziert einen Fehler enhält, erscheint die Mediendatei für das System allerdings auch (und in diesem Fall fälschlich) als ungenutzt.`
      });
    }
  });
};
