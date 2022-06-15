const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');

module.exports = data => {
    fsExtra.emptyDirSync(data.buildDir);

    const dirs = new Set();

    dirs.add('api');
    dirs.add('api/search');

    dirs.add('autoren');
    data.authors.forEach(author => dirs.add(`autoren/${author.permalink}`));
    data.authorsPaginated.forEach(pagination => dirs.add(`autoren/${pagination.label}`));
    data.bookAuthors.forEach(author => dirs.add(`autoren/${author.permalink}`));
    
    dirs.add('buecher');
    data.books.forEach(book => dirs.add(`buecher/${book.permalink}`));
    data.booksPaginated.forEach(pagination => dirs.add(`buecher/${pagination.label}`));

    dirs.add('features');
    
    dirs.add('festival');
    
    dirs.add('kino');
    data.screenings.forEach(screening => dirs.add(`kino/${screening.permalink}`));

    dirs.add('newsletter');

    dirs.add('radio');
    data.programs.forEach(program => dirs.add(`radio/${program.permalink}`));
    data.programsPaginated.forEach(pagination => dirs.add(`radio/${pagination.label}`));

    dirs.add('seite-nicht-gefunden');
    
    dirs.add('suche');

    dirs.add('tags');
    data.tags.forEach(tag => dirs.add(`tags/${tag.permalink}`));

    dirs.add('texte');
    data.articles.forEach(article => dirs.add(`texte/${article.permalink}`));
    data.articlesPaginated.forEach(pagination => dirs.add(`texte/${pagination.label}`));
    data.articles.forEach(article => dirs.add(`texte/${article.permalink}/druckversion`));

    dirs.add('verlage');
    data.publishers.forEach(publisher => dirs.add(`verlage/${publisher.permalink}`));

    dirs.add('zeitschrift');
    data.issues.forEach(issue => dirs.add(`zeitschrift/${issue.permalink}`));

    data.pages.forEach(page => dirs.add(page.permalink));

    dirs.forEach(dir => fs.mkdirSync(path.join(data.buildDir, dir), { recursive: true }));
};
