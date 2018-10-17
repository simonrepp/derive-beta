const fsExtra = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

module.exports = async (data, urbanize, preview) => {

  const copy = (fromRelative, toRelative) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    return fsExtra.copy(fromAbsolute, toAbsolute);
  };

  const copyResized = async (imageObj, fromRelative, toRelative, toRelativeCropped) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    const image = sharp(fromAbsolute);

    let { width, height } = await image.metadata();

    if(width >= height && width > 960) {
      height = parseInt((960 / width) * height);
      width = 960;
    } else if(height >= width && height > 960) {
      width = parseInt((960 / height) * width);
      height = 960;
    }

    imageObj.width = width;
    imageObj.height = height;

    if(toRelativeCropped) {
      const toAbsoluteCropped = path.join(data.buildDir, toRelativeCropped);

      await image.resize(300, 300, { position: sharp.strategy.entropy })
                 .toFile(toAbsoluteCropped);
    }

    await image.resize(width, height)
               .toFile(toAbsolute);
  };

  const concurrentWrites = [];

  for(let event of urbanize.events) {
    if(event.image) {
      if(preview) {
        event.image.written = encodeURI(`/_root_media/${event.image.localFilesystemPath}`);
        event.image.writtenCropped = encodeURI(`/_root_media/${event.image.localFilesystemPath}`);
      } else {
        event.image.written = path.join('/veranstaltungen', event.permalink, `bild${path.extname(event.image.normalizedPath)}`);
        event.image.writtenCropped = path.join('/veranstaltungen', event.permalink, `bild-ausschnitt${path.extname(event.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(event.image, event.image.localFilesystemPath, event.image.written, event.image.writtenCropped) );
        event.image.written += `?${urbanize.assetHash}`;
        event.image.writtenCropped += `?${urbanize.assetHash}`;
      }
    }

    if(event.text) {
      let text = event.text.converted;

      if(preview) {
        for(let download of event.text.downloads) {
          download.written = encodeURI(`/_root_media/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of event.text.embeds) {
          embed.written = encodeURI(`/_root_media/${embed.localFilesystemPath}`);
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
          concurrentWrites.push( copyResized(embed, embed.localFilesystemPath, embed.written) );
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
        feature.image.written = encodeURI(`/_root_media/${feature.image.localFilesystemPath}`);
      } else {
        feature.image.written = path.join('/features', `bild-${featureNumber++}${path.extname(feature.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(feature.image, feature.image.localFilesystemPath, feature.image.written) );
        feature.image.written += `?${urbanize.assetHash}`;
      }
    }
  }

  for(let page of urbanize.pages) {
    if(page.text) {
      let text = page.text.converted;

      if(preview) {
        for(let download of page.text.downloads) {
          download.written = encodeURI(`/_root_media/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(let embed of page.text.embeds) {
          embed.written = encodeURI(`/_root_media/${embed.localFilesystemPath}`);
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
          concurrentWrites.push( copyResized(embed, embed.localFilesystemPath, embed.written) );
          embed.written += `?${urbanize.assetHash}`;

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      page.text.written = text;
    }
  }

  await Promise.all(concurrentWrites);
};
