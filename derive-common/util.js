const fs = require('fs'),
      glob = require('glob'),
      path = require('path'),
      markdownIt = require('markdown-it')({ html: true });

const plaindata = require('../plaindata/plaindata.js');

exports.createDir = (base, directory) => new Promise((resolve, reject) =>
  fs.mkdir(path.join(base, directory), err => err ? reject(err) : resolve())
);

exports.globFiles = (directory, pattern) => new Promise((resolve, reject) =>
  glob(pattern, { cwd: directory, nodir: true }, (err, files) => err ? reject(err) : resolve(files))
);

exports.loadFile = filePath => new Promise((resolve, reject) =>
  fs.readFile(filePath, 'utf-8', (err, content) => err ? reject(err) : resolve(content))
);

exports.loadPlain = (directory, plainPath) => new Promise((resolve, reject) =>
  fs.readFile(path.join(directory, plainPath), 'utf-8', (err, content) => {
    if(err) {
      reject(err);
    } else {
      try {
        resolve( plaindata.parse(content) );
      } catch(err) {
        reject(err);
      }
    }
  })
);

exports.renderMarkdown = markdown => {
  // TODO: Custom markdown processing ? (footnotes?)
  return markdownIt.render(markdown);
};

exports.statFile = (directory, filePath) => new Promise((resolve, reject) =>
  fs.stat(path.join(directory, filePath), (err, stat) => err ? reject(err) : resolve(stat))
);

exports.writeFile = (directory, filePath, content) => new Promise((resolve, reject) =>
  fs.writeFile(path.join(directory, filePath), content, err => err ? reject(err) : resolve())
);
