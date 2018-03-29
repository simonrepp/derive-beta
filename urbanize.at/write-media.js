const fsExtra = require('fs-extra'),
      path = require('path'),
      sharp = require('sharp');
      
module.exports = async (data, urbanize) => {

  const copy = (fromRelative, toRelative) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    return fsExtra.copy(fromAbsolute, toAbsolute);
  };

  const copyCropped = (fromRelative, toRelative) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    return sharp(fromAbsolute).resize(300, 300)
                             .crop(sharp.strategy.entropy)
                             .toFile(toAbsolute);
  };

  const copyResized = (fromRelative, toRelative) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    return sharp(fromAbsolute).resize(960, 960)
                             .max()
                             .withoutEnlargement()
                             .toFile(toAbsolute);
  };
  
  const concurrentWrites = [];

  for(let event of urbanize.events) {
    if(event.image) {
      const finalPath = path.join('/veranstaltungen', event.permalink, `bild${path.extname(event.image.connected)}`);
      event.image.written = finalPath;
      
      concurrentWrites.push( copyCropped(event.image.connected, finalPath) );
    }

    if(event.text) {
      let written = event.text.connected;

      for(let [originalFilePath, replacedFilePath] of event.text.downloads) {
        const finalPath = path.join('/veranstaltungen', event.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);
        
        concurrentWrites.push( copy(originalFilePath, finalPath) );
      }

      for(let [originalFilePath, replacedFilePath] of event.text.embeds) {
        const finalPath = path.join('/veranstaltungen', event.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);
        
        concurrentWrites.push( copyResized(originalFilePath, finalPath) );
      }

      event.text.written = written;
    }
  }

  // TODO: Here and elsewhere - german permalinks for pages!
  
  for(let page of urbanize.pages) {
    if(page.text) {
      let written = page.text.connected;
  
      for(let [originalFilePath, replacedFilePath] of page.text.downloads) {
        const finalPath = path.join('/seiten', page.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);
        
        concurrentWrites.push( copy(originalFilePath, finalPath) );
      }
  
      for(let [originalFilePath, replacedFilePath] of page.text.embeds) {
        const finalPath = path.join('/seiten', page.permalink, replacedFilePath);
        written = written.replace(replacedFilePath, finalPath);
        
        concurrentWrites.push( copyResized(originalFilePath, finalPath) );
      }
  
      page.text.written = written;
    }
  }
  
  await Promise.all(concurrentWrites);
};
