const fs = require('fs');
const path = require('path');

const { loadEno } = require('../util.js');
const { ParseError, ValidationError } = require('enolib');

module.exports = async (data, enoPath) => {
    const cached = data.cache.get(enoPath);
    const stats = fs.statSync(path.join(data.root, enoPath));

    if(cached && stats.size === cached.stats.size && stats.mtimeMs === cached.stats.mtimeMs) {
        data.derive = cached.derive;
    } else {
        let doc;

        try {
            doc = loadEno(data.root, enoPath);
        } catch(err) {
            data.cache.delete(enoPath);

            if(err instanceof ParseError) {
                data.errors.push({
                    files: [{ path: enoPath, selection: err.selection }],
                    message: err.text,
                    snippet: err.snippet
                });

                return;
            } else {
                throw err;
            }
        }

        const derive = { sourceFile: enoPath };

        doc.allElementsRequired();

        try {
            derive.accentColor = doc.field('Akzentfarbe').optionalColorValue();

            // Mark deployment configurations as touched (we don't use them here)
            doc.elements().map(element => {
                if (element.yieldsSection()) {
                    element.touch();
                }
            });

            doc.assertAllTouched();
        } catch(err) {
            data.cache.delete(enoPath);

            if(err instanceof ValidationError) {
                data.errors.push({
                    files: [{ path: enoPath, selection: err.selection }],
                    message: err.text,
                    snippet: err.snippet
                });

                return;
            } else {
                throw err;
            }
        }

        data.cache.set(enoPath, { derive, stats });
        data.derive = derive;
    }
};
