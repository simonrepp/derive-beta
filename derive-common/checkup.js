module.exports = data => {
  data.categories.forEach(category => {
    if(category.spellings.size > 1) {
      data.warnings.push({
        message: `**Verschiedene Schreibweisen einer Kategorie**\n\nFür eine Kategorie wurden mehrere Schreibweisen gefunden: ${[...category.spellings].map(spelling => `"${spelling}"`).join(', ')}. Dies sollte manuell (mit Hilfe der Volltextsuche) korrigiert werden.`
      });
    }
  });

  data.tags.forEach(tag => {
    if(tag.spellings.size > 1) {
      data.warnings.push({
        message: `**Verschiedene Schreibweisen eines Tags**\n\nFür einen Tag wurden mehrere Schreibweisen gefunden: ${[...tag.spellings].map(spelling => `"${spelling}"`).join(', ')}. Dies sollte manuell (mit Hilfe der Volltextsuche) korrigiert werden.`
      });
    }
  });

  data.media.forEach(media => {
    if(!media.used) {
      data.warnings.push({
        files: [{ path: media.localFilesystemPath }],
        message: `Die Mediendatei ${media.localFilesystemPath} wird in keinerlei Texten oder Dateifeldern genutzt. <span class="icon icon-question text-highlight" title="Dies kann ein Hinweis darauf sein, dass der Pfad zu der Datei in einem Markdown oder Dateifeld inkorrekt ist. Falls ein Dokument dass diese Mediendatei referenziert einen Fehler enhält, erscheint die Mediendatei für das System allerdings auch (in diesem Fall fälschlich) als ungenutzt."></span>`
      });
    }
  });
};
