const fs = require('fs');
const eno = require('enojs');
const { HtmlReporter } = require('enojs');
const markdownIt = require('markdown-it')({ html: true });
const markdownItFootnote = require('markdown-it-footnote');
const path = require('path');
const striptags = require('striptags');

markdownIt.use(markdownItFootnote);
markdownIt.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  const url = token.attrs[srcIndex][1];
  const caption = token.content;

  return `
    <div><img class="generic__image_restraint" src="${url}" alt="${caption}"></div>
    ${caption ? `<small>${caption}</small>` : ''}
  `.trim();
}

exports.FEATURE_TYPE_ENUM = [
  'landscape',
  'portrait',
  'card'
];

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
        resolve( eno.parse(content, { locale: 'de', reporter: HtmlReporter }) );
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
