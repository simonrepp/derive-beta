const fsExtra = require('fs-extra');
const moment = require('moment');
const path = require('path');
const striptags = require('striptags');

const { writeFile } = require('../derive-common/util.js');

const indexArticles = data => {
  const indexed = Array.from(data.articles.values()).map(article => {
    const boosted = `${article.title} ${article.subtitle || ''}`;
    const regular = [article.abstract ? striptags(article.abstract.converted) : '',
                     article.authors.map(author => author.name).join(' '),
                     article.categories.map(category => category.name).join(' '),
                     article.tags.map(tag => tag.name).join(' '),
                     article.text ? striptags(article.text.written) : ''].join(' ');

    return {
      article: {
        authors: article.authors.map(author => ({
          name: author.name,
          permalink: author.permalink
        })),
        image: article.image ? { written: article.image.written } : null,
        inIssueOnPages: article.inIssueOnPages,
        issue: article.issue ? {
          cover: { written: article.issue.cover.written },
          number: article.issue.number,
          permalink: article.issue.permalink,
          quarter: article.issue.quarter,
          year: article.issue.year
        } : null,
        permalink: article.permalink,
        subtitle: article.subtitle,
        title: article.title
      },
      textBoosted: boosted,
      textRegular: regular
    };
  });

  return JSON.stringify(indexed);
};

const indexAuthors = data => {
  const indexed = data.authors.map(author => {
    const boosted = `${author.name} ${author.biography ? striptags(author.biography.converted) : ''}`;
    const regular = [author.city || '',
                     author.country || '',
                     author.tags.map(tag => tag.name).join(' '),
                     author.text ? striptags(author.text.converted) : '',
                     author.website || ''].join(' ');

    return {
      author: {
        biography: author.biography,
        name: author.name,
        permalink: author.permalink
      },
      textBoosted: boosted,
      textRegular: regular,
    };
  });

  return JSON.stringify(indexed);
};

const indexBooks = data => {
  const indexed = Array.from(data.books.values()).map(book => {
    const boosted = `${book.title} ${book.isxn || ''}`;
    const regular = [book.authors.map(author => author.name).join(' '),
                     book.description ? striptags(book.description.converted) : '',
                     book.publishers.map(publisher => publisher.name).join(' '),
                     book.tags.map(tag => tag.name).join(' '),
                     book.placeOfPublication || '',
                     book.url || '',
                     book.yearOfPublication || ''].join(' ');

    return {
      book: {
        authors: book.authors.map(author => ({
            name: author.name,
            permalink: author.permalink
        })),
        cover: book.cover ? { written: book.cover.written } : null,
        permalink: book.permalink,
        placeOfPublication: book.placeOfPublication,
        publishers: book.publishers.map(publisher => ({
            name: publisher.name,
            permalink: publisher.permalink
        })),
        reviews: book.reviews.map(review => ({
          permalink: review.permalink
        })),
        subtitle: book.subtitle,
        title: book.title,
        yearOfPublication: book.yearOfPublication
      },
      textBoosted: boosted,
      textRegular: regular
    };
  });

  return JSON.stringify(indexed);
};

const indexIssues = data => {
  const indexed = Array.from(data.issues.values()).map(issue => {
    const boosted = [`dérive N° ${issue.number}`,
                     issue.title,
                     issue.features.join(' ')].join(' ');
    const regular = [issue.cooperation || '',
                     issue.description ? striptags(issue.description.converted) : '',
                     issue.tags.map(tag => tag.name).join(' ')].join(' ');

    return {
      issue: {
        cover: { written: issue.cover.written },
        number: issue.number,
        outOfPrint: issue.outOfPrint,
        pages: issue.pages,
        permalink: issue.permalink,
        quarter: issue.quarter,
        title: issue.title,
        year: issue.year
      },
      textBoosted: boosted,
      textRegular: regular
    };
  });

  return JSON.stringify(indexed);
};

const indexPrograms = data => {
  const indexed = Array.from(data.programs.values()).map(program => {
    const boosted = [program.title, program.subtitle].join(' ');
    const regular = [program.abstract ? striptags(program.abstract.converted) : '',
                     program.editors.map(editor => editor.name).join(' '),
                     program.categories.map(category => category.name).join(' '),
                     program.tags.map(tag => tag.name).join(' '),
                     program.text ? striptags(program.text.written) : ''].join(' ');

    return {
      program: {
        editors: program.editors.map(editor => ({
          name: editor.name,
          permalink: editor.permalink
        })),
        firstBroadcast: moment(program.firstBroadcast).locale('de').format('Do MMMMM YYYY'),
        permalink: program.permalink,
        subtitle: program.subtitle,
        title: program.title
      },
      textBoosted: boosted,
      textRegular: regular
    };
  });

  return JSON.stringify(indexed);
};

module.exports = async data => {
  await fsExtra.copy(path.join(__dirname, 'search/index.php'),
                     path.join(data.buildDir, 'api/search/index.php'));

  return Promise.all([
    writeFile(data.buildDir, '/api/search/articles.json', indexArticles(data)),
    writeFile(data.buildDir, '/api/search/authors.json', indexAuthors(data)),
    writeFile(data.buildDir, '/api/search/books.json', indexBooks(data)),
    writeFile(data.buildDir, '/api/search/issues.json', indexIssues(data)),
    writeFile(data.buildDir, '/api/search/programs.json', indexPrograms(data))
  ]);
};
