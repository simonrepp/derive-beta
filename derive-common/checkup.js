const path = require('path');

module.exports = data => {
  const exts = new Set();

  data.media.forEach((usageCount, filePath) => {
    const ext = path.extname(filePath);

    if(!ext.trim()) {
      console.log('No extension: ', filePath);
    } else if(ext === '.2_Glossary_VIENNAHousingByTenure' || ext === '.doc' || ext === '.eps') {
      console.log('Curious extension: ', filePath);
    }

    exts.add(path.extname(filePath));

    if(usageCount === 0) {
      data.warnings.push({
        description: `Dies ist nur ein Hinweis, ansonsten bestehen keine Auswirkungen.\n\n**Betroffenes File:** ${filePath}`,
        detail: `TODO`, // TODO:
        files: [{ path: filePath }], // TODO: Needs to be opened externally, or file explorer with parent directory
        header: `**Ungenützte Datei**\n\nDie Mediendatei ${filePath} wird in keinerlei Texten oder Dateifeldern genutzt.`
      });
    }
  });

  console.log([...exts]);
};
