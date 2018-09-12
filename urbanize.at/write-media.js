const fsExtra = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

module.exports = async (data, urbanize, preview) => {

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
      if(preview) {
        event.image.written = `${data.rootServerUrl}/${event.image.localFilesystemPath}`;
      } else {
        event.image.written = path.join('/veranstaltungen', event.permalink, `bild${path.extname(event.image.normalizedPath)}`);
        concurrentWrites.push( copyCropped(event.image.localFilesystemPath, event.image.written) );
      }
    }

    if(event.text) {
      let text = event.text.converted;

      if(preview) {
        for(let download of event.text.downloads) {
          download.written = `${data.rootServerUrl}/${download.localFilesystemPath}`;
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of event.text.embeds) {
          embed.written = `${data.rootServerUrl}/${embed.localFilesystemPath}`;
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(let download of event.text.downloads) {
          download.written = path.join('/veranstaltungen', event.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );

          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of event.text.embeds) {
          embed.written = path.join('/veranstaltungen', event.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      event.text.written = text;
    }
  }


  for(let page of urbanize.pages) {
    if(page.text) {
      let text = page.text.converted;

      if(preview) {
        for(let download of page.text.downloads) {
          download.written = `${data.rootServerUrl}/${download.localFilesystemPath}`;
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of page.text.embeds) {
          embed.written = `${data.rootServerUrl}/${embed.localFilesystemPath}`;
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(let download of page.text.downloads) {
          download.written = path.join(page.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );

          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of page.text.embeds) {
          embed.written = path.join(page.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      page.text.written = text;
    }
  }

  await Promise.all(concurrentWrites);
};
