const fs = require('fs');
const enolib = require('enolib');
const { HtmlReporter } = require('enolib');
const { date, datetime, email, integer, url } = require('enotype');
const { de } = require('enolib/locales');
const path = require('path');
const striptags = require('striptags');

const {
    boolean,
    featureType,
    pagesInfo,
    path: pathLoader,
    issueNumber,
    permalink,
    timeframe,
    urbanizeCategory,
    urbanizeLanguage,
    urlOrMailto
} = require('./loaders/loaders.js');
const { markdown, markdownWithMedia } = require('./loaders/loaders_markdown.js');

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
    timeframe,
    urbanizeCategory,
    urbanizeLanguage,
    url,
    urlOrMailto
});

exports.loadEno = (directory, enoPath) => {
    const content = fs.readFileSync(path.join(directory, enoPath), 'utf-8');
    return enolib.parse(content, { locale: de, reporter: HtmlReporter });
};

exports.random = array => array[Math.floor(Math.random() * array.length)];

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

exports.writeFile = (directory, filePath, content) => {
    fs.writeFileSync(path.join(directory, filePath), content);
};
