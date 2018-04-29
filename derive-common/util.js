const fs = require('fs'),
      glob = require('glob'),
      markdownIt = require('markdown-it')({ html: true }),
      markdownItFootnote = require('markdown-it-footnote'),
      path = require('path');

markdownIt.use(markdownItFootnote);

const plain = require('../adventurejs/adventure.js');

exports.URBANIZE_ENUM = [
  '2012',
  '2013',
  '2014',
  '2015',
  'Hamburg 2016',
  'Wien 2016',
  '2017',
  'Berlin 2018',
  'Wien 2018'
];

exports.createDir = (base, directory) => new Promise((resolve, reject) =>
  fs.mkdir(path.join(base, directory), err => err ? reject(err) : resolve())
);

exports.globFiles = (directory, pattern) => new Promise((resolve, reject) =>
  glob(pattern, { cwd: directory, nodir: true }, (err, files) => err ? reject(err) : resolve(files))
);

exports.loadFile = filePath => new Promise((resolve, reject) =>
  fs.readFile(filePath, 'utf-8', (err, content) => err ? reject(err) : resolve(content))
);

exports.loadAdventure = (directory, plainPath) => new Promise((resolve, reject) =>
  fs.readFile(path.join(directory, plainPath), 'utf-8', (err, content) => {
    if(err) {
      reject(err);
    } else {
      try {
        resolve( plain.parse(content, 'de') );
      } catch(err) {
        reject(err);
      }
    }
  })
);

exports.random = array => array[Math.floor(Math.random() * array.length)];

exports.renderMarkdown = markdown => {
  return markdownIt.render(markdown);
};

exports.statFile = (directory, filePath) => new Promise((resolve, reject) =>
  fs.stat(path.join(directory, filePath), (err, stat) => err ? reject(err) : resolve(stat))
);

exports.writeFile = (directory, filePath, content) => new Promise((resolve, reject) =>
  fs.writeFile(path.join(directory, filePath), content, err => err ? reject(err) : resolve())
);
