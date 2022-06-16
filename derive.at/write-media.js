const fsExtra = require('fs-extra');
const path = require('path');

let sharp;
try {
    sharp = require('sharp');
} catch {
    atom.notifications.addError(`Das Bildverarbeitungsmodul 'sharp' ist auf diesem System nicht verfügbar (es konnte bei der Plugininstallation nicht installiert werden). Bis auf das updaten der Seiten ((staging.)derive.at/(staging.)urbanize.at) ist das Plugin dennoch voll funktionsfähig!`, { dismissable: true });
    sharp = () => {
        atom.notifications.addError(`Das Bildverarbeitungsmodul 'sharp' ist auf diesem System nicht verfügbar. Updaten der Seiten ((staging.)derive.at/(staging.)urbanize.at) ist deshalb von dieser Installation nicht möglich!`, { dismissable: true });
        throw 'sharp nicht verfügbar';
    }
}

module.exports = async (data, preview) => {
    const copy = (fromRelative, toRelative) => {
        const fromAbsolute = path.join(data.root, fromRelative);
        const toAbsolute = path.join(data.buildDir, toRelative);

        return fsExtra.copy(fromAbsolute, toAbsolute, { preserveTimestamps: true });
    };

    const copyResized = (fromRelative, toRelative) => {
        const fromAbsolute = path.join(data.root, fromRelative);
        const toAbsolute = path.join(data.buildDir, toRelative);

        return new Promise((resolve, reject) => {
            return sharp(fromAbsolute).resize({
                    fit: 'inside',
                    height: 960,
                    width: 960,
                    withoutEnlargement: true
                })
                .toFile(toAbsolute)
                .then(result => resolve(result))
                .catch(err => reject(`Die Bildumrechung des Ausgangsbilds ${fromAbsolute} in die Zieldatei ${toAbsolute} hat nicht funktioniert. Debuginformation der sharp library: ${err}`));
        });
    };

    const concurrentWrites = [];

    for (const article of data.articles.values()) {
        if (article.image) {
            if (preview) {
                article.image.written = encodeURI(`/_root_media/${article.image.localFilesystemPath}`);
            } else {
                article.image.written = path.join('/texte', article.permalink, `bild${path.extname(article.image.normalizedPath)}`);
                concurrentWrites.push( copyResized(article.image.localFilesystemPath, article.image.written) );
                article.image.written += `?${data.assetHash}`;
            }
        }

        if (article.readable && article.text) {
            let text = article.text.converted;

            if (preview) {
                for (const download of article.text.downloads) {
                    download.written = encodeURI(`/_root_media/${download.localFilesystemPath}`);
                    text = text.replace(download.placeholder, download.written);
                }

                for (const embed of article.text.embeds) {
                    embed.written = encodeURI(`/_root_media/${embed.localFilesystemPath}`);
                    text = text.replace(embed.placeholder, embed.written);
                }
            } else {
                for (const download of article.text.downloads) {
                    download.written = path.join('/texte', article.permalink, `text-${download.virtualFilename}`);
                    concurrentWrites.push( copy(download.localFilesystemPath, download.written) );
                    download.written += `?${data.assetHash}`;

                    text = text.replace(download.placeholder, download.written);
                }

                for (const embed of article.text.embeds) {
                    embed.written = path.join('/texte', article.permalink, `text-${embed.virtualFilename}`);
                    concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );
                    embed.written += `?${data.assetHash}`;

                    text = text.replace(embed.placeholder, embed.written);
                }
            }

            article.text.written = text;
        }
    }

    for (const book of data.books.values()) {
        if (book.cover) {
            if (preview) {
                book.cover.written = encodeURI(`/_root_media/${book.cover.localFilesystemPath}`);
            } else {
                book.cover.written = path.join('/buecher', book.permalink, `cover${path.extname(book.cover.normalizedPath)}`);
                concurrentWrites.push( copyResized(book.cover.localFilesystemPath, book.cover.written) );
                book.cover.written += `?${data.assetHash}`;
            }
        }
    }

    // Cinema

    for (const screening of data.screenings.values()) {
        if (preview) {
            screening.image.written = encodeURI(`/_root_media/${screening.image.localFilesystemPath}`);
        } else {
            screening.image.written = path.join('/kino', screening.permalink, `bild${path.extname(screening.image.normalizedPath)}`);
            concurrentWrites.push( copyResized(screening.image.localFilesystemPath, screening.image.written) );
            screening.image.written += `?${data.assetHash}`;
        }
    }

    let featureNumber = 0;
    for (const feature of data.features.values()) {
        if (feature.image) {
            if (preview) {
                feature.image.written = encodeURI(`/_root_media/${feature.image.localFilesystemPath}`);
            } else {
                feature.image.written = path.join('/features', `bild-${featureNumber++}${path.extname(feature.image.normalizedPath)}`);
                concurrentWrites.push( copyResized(feature.image.localFilesystemPath, feature.image.written) );
                feature.image.written += `?${data.assetHash}`;
            }
        }
    }

    let festivalNumber = 0;
    if (preview) {
        data.festival.image.written = encodeURI(`/_root_media/${data.festival.image.localFilesystemPath}`);
    } else {
        data.festival.image.written = path.join('/festival', `bild-${festivalNumber++}${path.extname(data.festival.image.normalizedPath)}`);
        concurrentWrites.push( copyResized(data.festival.image.localFilesystemPath, data.festival.image.written) );
        data.festival.image.written += `?${data.assetHash}`;
    }
    for (const edition of data.festival.editions) {
        if (preview) {
            edition.image.written = encodeURI(`/_root_media/${edition.image.localFilesystemPath}`);
        } else {
            edition.image.written = path.join('/festival', `bild-${festivalNumber++}${path.extname(edition.image.normalizedPath)}`);
            concurrentWrites.push( copyResized(edition.image.localFilesystemPath, edition.image.written) );
            edition.image.written += `?${data.assetHash}`;
        }
    }

    for (const issue of data.issues.values()) {
        if (issue.cover) {
            if (preview) {
                issue.cover.written = encodeURI(`/_root_media/${issue.cover.localFilesystemPath}`);
            } else {
                issue.cover.written = path.join('/zeitschrift', issue.permalink, `cover${path.extname(issue.cover.normalizedPath)}`);
                concurrentWrites.push( copyResized(issue.cover.localFilesystemPath, issue.cover.written) );
                issue.cover.written += `?${data.assetHash}`;
            }
        }
    }

    for (const page of data.pages.values()) {
        let text = page.text.converted;

        if (preview) {
            for (const download of page.text.downloads) {
                download.written = encodeURI(`/_root_media/${download.localFilesystemPath}`);
                text = text.replace(download.placeholder, download.written);
            }

            for (const embed of page.text.embeds) {
                embed.written = encodeURI(`/_root_media/${embed.localFilesystemPath}`);
                text = text.replace(embed.placeholder, embed.written);
            }
        } else {
            for (const download of page.text.downloads) {
                download.written = path.join('/', page.permalink, `text-${download.virtualFilename}`);
                concurrentWrites.push( copy(download.localFilesystemPath, download.written) );
                download.written += `?${data.assetHash}`;

                text = text.replace(download.placeholder, download.written);
            }

            for (const embed of page.text.embeds) {
                embed.written = path.join('/', page.permalink, `text-${embed.virtualFilename}`);
                concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );
                embed.written += `?${data.assetHash}`;

                text = text.replace(embed.placeholder, embed.written);
            }
        }

        page.text.written = text;
    }

    // Radio

    for (const program of data.programs.values()) {
        if (program.image) {
            if (preview) {
                program.image.written = encodeURI(`/_root_media/${program.image.localFilesystemPath}`);
            } else {
                program.image.written = path.join('/radio', program.permalink, `bild${path.extname(program.image.normalizedPath)}`);
                concurrentWrites.push( copyResized(program.image.localFilesystemPath, program.image.written) );
                program.image.written += `?${data.assetHash}`;
            }
        }

        if (program.soundfile) {
            if (preview) {
                program.soundfile.written = encodeURI(`/_root_media/${program.soundfile.localFilesystemPath}`);
            } else {
                program.soundfile.written = path.join('/radio', program.permalink, `aufnahme${path.extname(program.soundfile.normalizedPath)}`);
                concurrentWrites.push( copy(program.soundfile.localFilesystemPath, program.soundfile.written) );
                program.soundfile.written += `?${data.assetHash}`;
            }
        }

        if (program.text) {
            let text = program.text.converted;

            if (preview) {
                for (const download of program.text.downloads) {
                    download.written = encodeURI(`/_root_media/${download.localFilesystemPath}`);
                    text = text.replace(download.placeholder, download.written);
                }

                for (const embed of program.text.embeds) {
                    embed.written = encodeURI(`/_root_media/${embed.localFilesystemPath}`);
                    text = text.replace(embed.placeholder, embed.written);
                }
            } else {
                for (const download of program.text.downloads) {
                    download.written = path.join('/radio', program.permalink, `text-${download.virtualFilename}`);
                    concurrentWrites.push( copy(download.localFilesystemPath, download.written) );
                    download.written += `?${data.assetHash}`;

                    text = text.replace(download.placeholder, download.written);
                }

                for (const embed of program.text.embeds) {
                    embed.written = path.join('/radio', program.permalink, `text-${embed.virtualFilename}`);
                    concurrentWrites.push( copyResized(embed.localFilesystemPath, embed.written) );
                    embed.written += `?${data.assetHash}`;

                    text = text.replace(embed.placeholder, embed.written);
                }
            }

            program.text.written = text;
        }
    }

    await Promise.all(concurrentWrites);
};
