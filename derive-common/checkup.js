const path = require('path');

module.exports = data => {
  const exts = new Set();

  data.media.forEach((touched, filePath) => {
    if(!touched) {
      data.warnings.push({
        description: `Dies ist nur ein Hinweis, ansonsten bestehen keine Auswirkungen.\n\n**Betroffenes File:** ${filePath}`,
        detail: `Die Mediendatei ${filePath} wird in keinerlei Texten oder Dateifeldern genutzt - dies kann ein Hinweis darauf sein, dass der Pfad zu der Datei in einem Markdown-Feld inkorrekt ist. Falls ein Plain Data Dokument dass in einem seiner Datenfelder die Mediendatei referenziert einen Fehler enhält, erscheint die Mediendatei für das System allerdings auch (und in diesem Fall fälschlich) als ungenutzt.`,
        files: [{ path: filePath }],
        header: `**Ungenützte Mediendatei**`
      });
    }
  });
};
