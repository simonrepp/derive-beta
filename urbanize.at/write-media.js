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
        event.image.written = encodeURI(`${data.rootServerUrl}/${event.image.localFilesystemPath}`);
      } else {
        event.image.written = path.join('/veranstaltungen', event.permalink, `bild${path.extname(event.image.normalizedPath)}`);
        concurrentWrites.push( copyCropped(event.image.localFilesystemPath, event.image.written) );
        event.image.written += `?${urbanize.assetHash}`;
      }
    }

    if(event.text) {
      let text = event.text.converted;

      if(preview) {
        for(let download of event.text.downloads) {
          download.written = encodeURI(`${data.rootServerUrl}/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of event.text.embeds) {
          embed.written = encodeURI(`${data.rootServerUrl}/${embed.localFilesystemPath}`);
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(let download of event.text.downloads) {
          download.written = path.join('/veranstaltungen', event.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );
          download.written += `?${urbanize.assetHash}`;

          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of event.text.embeds) {
          embed.written = path.join('/veranstaltungen', event.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );
          embed.written += `?${urbanize.assetHash}`;

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      event.text.written = text;
    }
  }

  let featureNumber = 0;
  for(let feature of urbanize.features) {
    if(feature.image) {
      if(preview) {
        feature.image.written = encodeURI(`${data.rootServerUrl}/${feature.image.localFilesystemPath}`);
      } else {
        feature.image.written = path.join('/features', `bild-${featureNumber++}${path.extname(feature.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(feature.image.localFilesystemPath, feature.image.written) );
        feature.image.written += `?${urbanize.assetHash}`;
      }
    }
  }

  for(let page of urbanize.pages) {
    if(page.text) {
      let text = page.text.converted;

      if(preview) {
        for(let download of page.text.downloads) {
          download.written = encodeURI(`${data.rootServerUrl}/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of page.text.embeds) {
          embed.written = encodeURI(`${data.rootServerUrl}/${embed.localFilesystemPath}`);
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(let download of page.text.downloads) {
          download.written = path.join('/', page.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );
          download.written += `?${urbanize.assetHash}`;

          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of page.text.embeds) {
          embed.written = path.join('/', page.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );
          embed.written += `?${urbanize.assetHash}`;

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      page.text.written = text;
    }
  }

  await Promise.all(concurrentWrites);
};
