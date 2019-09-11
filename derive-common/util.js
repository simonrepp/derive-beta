const fs = require('fs');
const enolib = require('enolib');
const { HtmlReporter } = require('enolib');
const { date, datetime, email, integer, url } = require('enotype');
const { de } = require('enolib/locales');
const path = require('path');
const striptags = require('striptags');

const boolean = require('./loaders/boolean.js');
const featureType = require('./loaders/feature_type.js');
const { markdown, markdownWithMedia } = require('./loaders/markdown.js');
const pagesInfo = require('./loaders/pages_info.js');
const pathLoader = require('./loaders/path.js');
const issueNumber = require('./loaders/issue_number.js');
const permalink = require('./loaders/permalink.js');
const urbanizeCategory = require('./loaders/urbanize/category.js');
const urbanizeLanguage = require('./loaders/urbanize/language.js');

enolib.register({
  boolean,
  date,
  datetime,
  email,
  featureType,
  integer,
  issueNumber,
  markdown,
  markdownWithMedia,
  pagesInfo,
  path: pathLoader,
  permalink,
  urbanizeCategory,
  urbanizeLanguage,
  url
});

exports.createDir = (base, directory) => new Promise((resolve, reject) =>
  fs.mkdir(path.join(base, directory), err => err ? reject(err) : resolve())
);

exports.featureSort = (a, b) => {
  if(a.type === 'landscape' && b.type !== 'landscape')
    return -1;
  if(b.type === 'landscape' && a.type !== 'landscape')
    return 1;

  if(a.type === 'portrait' && b.type !== 'portrait')
    return -1;
  if(b.type === 'portrait' && a.type !== 'portrait')
    return 1;

  if(a.type === 'card' && b.type !== 'card')
    return -1;
  if(b.type === 'card' && a.type !== 'card')
    return 1;

  return a.position - b.position;
};

exports.loadFile = filePath => new Promise((resolve, reject) =>
  fs.readFile(filePath, 'utf-8', (err, content) => err ? reject(err) : resolve(content))
);

exports.loadEno = (directory, enoPath) => new Promise((resolve, reject) =>
  fs.readFile(path.join(directory, enoPath), 'utf-8', (err, content) => {
    if(err) {
      reject(err);
    } else {
      try {
        resolve( enolib.parse(content, { locale: de, reporter: HtmlReporter }) );
      } catch(err) {
        reject(err);
      }
    }
  })
);

exports.random = array => array[Math.floor(Math.random() * array.length)];

exports.statFile = (directory, filePath) => new Promise((resolve, reject) =>
  fs.stat(path.join(directory, filePath), (err, stat) => err ? reject(err) : resolve(stat))
);

exports.stripAndTruncateHtml = (html, length, link) => {
  const stripped = striptags(html);

  if(stripped.length > length) {
    const boundary = stripped.lastIndexOf(' ', length - 3);
    const truncated = boundary === -1 ? stripped.substr(0, length - 3) : stripped.substr(0, boundary);

    if(link) {
      return `${truncated} <a href="${link}">…</a>`;
    } else {
      return `${truncated} …`;
    }
  } else {
    return stripped;
  }
};

exports.writeFile = (directory, filePath, content) => new Promise((resolve, reject) =>
  fs.writeFile(path.join(directory, filePath), content, err => err ? reject(err) : resolve())
);
