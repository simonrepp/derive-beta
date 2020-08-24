const fsExtra = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

module.exports = async (data, urbanize, preview) => {

  const copy = (fromRelative, toRelative) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    return fsExtra.copy(fromAbsolute, toAbsolute, { preserveTimestamps: true });
  };

  const copyResized = async (imageObj, fromRelative, toRelative, toRelativeCropped) => {
    const fromAbsolute = path.join(data.root, fromRelative);
    const toAbsolute = path.join(data.buildDir, toRelative);

    const image = sharp(fromAbsolute);

    let { width, height } = await image.metadata();

    if(width >= height && width > 1160) {
      height = parseInt((1160 / width) * height);
      width = 1160;
    } else if(height >= width && height > 960) {
      width = parseInt((960 / height) * width);
      height = 960;
    }

    imageObj.width = width;
    imageObj.height = height;

    if(toRelativeCropped) {
      const toAbsoluteCropped = path.join(data.buildDir, toRelativeCropped);

      await image.resize({
                    fit: sharp.fit.cover,
                    height: 300,
                    position: sharp.strategy.entropy,
                    width: 300
                  })
                 .toFile(toAbsoluteCropped);
    }

    await image.resize(width, height)
               .toFile(toAbsolute);
  };

  const concurrentWrites = [];

  for(const event of Object.values(urbanize.events)) {
    if(event.image) {
      if(preview) {
        event.image.written = encodeURI(`/_root_media/${event.image.localFilesystemPath}`);
        event.image.writtenCropped = encodeURI(`/_root_media/${event.image.localFilesystemPath}`);
      } else {
        event.image.written = path.join('/', event.permalink, `bild${path.extname(event.image.normalizedPath)}`);
        event.image.writtenCropped = path.join('/', event.permalink, `bild-ausschnitt${path.extname(event.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(event.image, event.image.localFilesystemPath, event.image.written, event.image.writtenCropped) );
        event.image.written += `?${urbanize.assetHash}`;
        event.image.writtenCropped += `?${urbanize.assetHash}`;
      }
    }

    if(event.text) {
      let text = event.text.converted;

      if(preview) {
        for(const download of event.text.downloads) {
          download.written = encodeURI(`/_root_media/${download.localFilesystemPath}`);
          text = text.replace(download.placeholder, download.written);
        }

        for(const embed of event.text.embeds) {
          embed.written = encodeURI(`/_root_media/${embed.localFilesystemPath}`);
          text = text.replace(embed.placeholder, embed.written);
        }
      } else {
        for(const download of event.text.downloads) {
          download.written = path.join('/', event.permalink, `text-${download.virtualFilename}`);
          concurrentWrites.push( copy(download.localFilesystemPath, download.written) );
          download.written += `?${urbanize.assetHash}`;

          text = text.replace(download.placeholder, download.written);
        }

        for(const embed of event.text.embeds) {
          embed.written = path.join('/', event.permalink, `text-${embed.virtualFilename}`);
          concurrentWrites.push( copyResized(embed, embed.localFilesystemPath, embed.written) );
          embed.written += `?${urbanize.assetHash}`;

          text = text.replace(embed.placeholder, embed.written);
        }
      }

      event.text.written = text;
    }
  }

  let featureNumber = 0;
  for(const feature of urbanize.home.features) {
    if(feature.image) {
      if(preview) {
        feature.image.written = encodeURI(`/_root_media/${feature.image.localFilesystemPath}`);
      } else {
        feature.image.written = path.join('/', `bild-${featureNumber++}${path.extname(feature.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(feature.image, feature.image.localFilesystemPath, feature.image.written) );
        feature.image.written += `?${urbanize.assetHash}`;
      }
    }
  }

  for(const page of Object.values(urbanize.pages)) {
    let imageNumber = 0;
    for(const galleryItem of page.gallery) {
      if(preview) {
        galleryItem.image.written = encodeURI(`/_root_media/${galleryItem.image.localFilesystemPath}`);
      } else {
        galleryItem.image.written = path.join('/', page.permalink, `bild-${imageNumber++}${path.extname(galleryItem.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(galleryItem.image, galleryItem.image.localFilesystemPath, galleryItem.image.written) );
        galleryItem.image.written += `?${urbanize.assetHash}`;
      }
    }

    if(!page.text) continue;

    let text = page.text.converted;

    if(preview) {
      for(const download of page.text.downloads) {
        download.written = encodeURI(`/_root_media/${download.localFilesystemPath}`);
        text = text.replace(download.placeholder, download.written);
      }

      for(const embed of page.text.embeds) {
        embed.written = encodeURI(`/_root_media/${embed.localFilesystemPath}`);
        text = text.replace(embed.placeholder, embed.written);
      }
    } else {
      for(const download of page.text.downloads) {
        download.written = path.join('/', page.permalink, `text-${download.virtualFilename}`);
        concurrentWrites.push( copy(download.localFilesystemPath, download.written) );
        download.written += `?${urbanize.assetHash}`;

        text = text.replace(download.placeholder, download.written);
      }

      for(const embed of page.text.embeds) {
        embed.written = path.join('/', page.permalink, `text-${embed.virtualFilename}`);
        concurrentWrites.push( copyResized(embed, embed.localFilesystemPath, embed.written) );
        embed.written += `?${urbanize.assetHash}`;

        text = text.replace(embed.placeholder, embed.written);
      }
    }

    page.text.written = text;
  }

  await Promise.all(concurrentWrites);
};
