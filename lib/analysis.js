const path = require('path');
const remote = require('remote');
const striptags = require('striptags');

const CITIES = [
    { name: 'Barcelona', regex: /Barcelona/gi },
    { name: 'Beirut', regex: /Beirut/gi },
    { name: 'Belgrad', regex: /Belgrad|Belgrade/gi },
    { name: 'Berlin', regex: /Berlin/gi },
    { name: 'Frankfurt', regex: /Frankfurt/gi },
    { name: 'Graz', regex: /Graz/gi },
    { name: 'Hamburg', regex: /Hamburg/gi },
    { name: 'Istanbul', regex: /Istanbul/gi },
    { name: 'Kairo', regex: /Kairo/gi },
    { name: 'Lagos', regex: /Lagos/gi },
    { name: 'Linz', regex: /Linz/gi },
    { name: 'London', regex: /London/gi },
    { name: 'Mumbai', regex: /Mumbai/gi },
    { name: 'München', regex: /München|Muenchen/gi },
    { name: 'New York', regex: /New York/gi },
    { name: 'Paris', regex: /Paris/gi },
    { name: 'Shanghai', regex: /Shanghai/gi },
    { name: 'Tokio', regex: /Tokio|Tokyo/gi },
    { name: 'Wien', regex: /Wien/gi },
    { name: 'Zürich', regex: /Zürich|Zuerich/gi }
];

const LONGEST_WORDS_ANALYSIS_COUNT = 50;

// Detect strings containing (inter-)punctuation like "x-y", "x/y", etc. for disqualification from longest words statistics
const LONGEST_WORD_PUNCTUATION_FILTER = /.\..|.-.|.\/.|.\\./;

// Detect strings containing http(s)://, www., .com, etc. for disqualification from longest words statistics
const LONGEST_WORD_URL_FILTER = /https?:\/\/|www\.|\.(at|com|com\.ar|de|in|it|net|org|ro)[/).]/;

async function openTempFile(filename, text) {
    const temporaryPath = path.join(remote.app.getPath('temp'), filename);

    const editor = await atom.workspace.open(temporaryPath, { split: 'right' });

    editor.setText(text);
    editor.setCursorScreenPosition([0, 0]);
    editor.save();
}

exports.bibliography = async data => {
    console.log(data);

    const authorReferences = [];
    const referencesUnprocessed = [];
    const titleReferences = [];

    for (const [key, article] of data.articles.entries()) {
        if (article.issue === null) {
            continue;
        }

        // Analyze bibliography

        if (!!article.bibliography?.converted) {
            const strippedBibliography = striptags(article.bibliography.converted);

            let lines = strippedBibliography.split('\n');

            for (const line of lines) {
                if (!line.trim().length) {
                    continue;
                }

                const matchLine = line.match(/^([^:]+):(.*)$/);

                if (matchLine) {
                    const authorsAndYear = matchLine[1];
                    const titleAndReference = matchLine[2];

                    const matchAuthorsAndYear = authorsAndYear.match(/^([^(]+[^(\s])(\s*\(.+\).*)?$/);

                    if (matchAuthorsAndYear) {
                        const authors = matchAuthorsAndYear[1];
                        const authorsSplit = authors.split(' &amp; ');

                        for (const author of authorsSplit) {
                            let registered = false;

                            for (const authorRef of authorReferences) {
                                if (authorRef.author === author) {
                                    registered = true;
                                    authorRef.count += 1;
                                    break;
                                }
                            }

                            if (!registered) {
                                authorReferences.push({
                                    author,
                                    count: 1
                                });
                            }
                        }
                    } else {
                        console.log('No match (authors & year): ' + authorsAndYear);
                    }


                    // const matchTitleAndReference = titleAndReference.match(/^([^(]+[^(\s])(\s*\(.+\).*)?$/);

                    // if (matchTitleAndReference) {
                    //     const authors = matchTitleAndReference[1];
                    //     const authorsSplit = authors.split(' &amp; ');

                    //     for (const author of authorsSplit) {
                    //         let registered = false;

                    //         for (const authorRef of authorReferences) {
                    //             if (authorRef.author === author) {
                    //                 registered = true;
                    //                 authorRef.count += 1;
                    //                 break;
                    //             }
                    //         }

                    //         if (!registered) {
                    //             authorReferences.push({
                    //                 author,
                    //                 count: 1
                    //             });
                    //         }
                    //     }
                    // } else {
                    //     console.log('No match (title & reference): ' + titleAndReference);
                    // }

                    let registered = false;

                    for (const titleRef of titleReferences) {
                        if (titleRef.title === titleAndReference) {
                            registered = true;
                            titleRef.count += 1;
                            break;
                        }
                    }

                    if (!registered) {
                        titleReferences.push({
                            count: 1,
                            title: titleAndReference
                        });
                    }
                } else {
                    referencesUnprocessed.push(line);
                }
            }
        }
    }

    authorReferences.sort((a, b) => {
        const countDiff = b.count - a.count;

        if (countDiff === 0) {
            return a.author.localeCompare(b.author);
        }

        return countDiff;
    });

    referencesUnprocessed.sort();
    titleReferences.sort((a, b) => {
        const countDiff = b.count - a.count;

        if (countDiff === 0) {
            return a.title.localeCompare(b.title);
        }

        return countDiff;
    });





    const authorStats = `
Meist zitierte Autor:innen im Literaturverzeichnis (Top 25):
------
${authorReferences.map(author => `${author.author} (${author.count} Referenzen)`).join('\n')}
    `.trim();

    openTempFile('Bibliografische Statistiken (Autor_innen).txt', authorStats);

    const titleStats = `
Meist zitierte Bücher im Literaturverzeichnis (Top 25):
------
${titleReferences.map(title => `${title.title} (${title.count} Referenzen)`).join('\n')}
    `.trim();

    openTempFile('Bibliografische Statistiken (Titel).txt', titleStats);

    const unprocessedStats = `
Unverarbeitete Referenzen im Literaturverzeichnis:
------
${referencesUnprocessed.join('\n')}
    `.trim();

    openTempFile('Bibliografische Statistiken (unverarbeitet).txt', unprocessedStats);
};

exports.general = async data => {
    console.log(data);

    let articleCount = 0;
    let totalCharacters = 0;

    const cityReferences = CITIES
        .map(city => ({
            articleCount: 0,
            name: city.name,
            referenceCount: 0,
            regex: city.regex
        }));

    const longestArticle = { length: 0 };
    const shortestArticle = { length: Infinity };

    const longestWords = [];
    const longestWordsWithPunctuation = [];

    for (const [key, article] of data.articles.entries()) {
        if (article.issue === null || article.text === null) {
            continue;
        }

        const stripped = striptags(article.text.converted);

        const length = stripped.length;

        // Register longest/shortest article

        // The chosen minimum length is an arbitrary choice based on filtering
        // out article texts found in the database that don't qualify as
        // proper article texts albeit having more than zero characters
        if (length > 376 && length < shortestArticle.length) {
        // if (length > 88 && length < shortestArticle.length) {
            shortestArticle.article = article;
            shortestArticle.length = length;
        } else if (length > longestArticle.length) {
            longestArticle.article = article;
            longestArticle.length = length;
        }

        // Add to average/total character stats

        articleCount += 1;
        totalCharacters += length;

        const words = stripped.split(/\s+/);

        for (const word of words) {
            const length = word.length;

            // Register longest words (without punctuation)

            if (
                longestWords.length < LONGEST_WORDS_ANALYSIS_COUNT ||
                longestWords[longestWords.length - 1].length < length
            ) {
                if (
                    !LONGEST_WORD_PUNCTUATION_FILTER.test(word) &&
                    !LONGEST_WORD_URL_FILTER.test(word)
                ) {
                    longestWords.push({
                        length: length,
                        word
                    });

                    longestWords.sort((a, b) => b.length - a.length);

                    if (longestWords.length > LONGEST_WORDS_ANALYSIS_COUNT) {
                        longestWords.pop();
                    }
                }
            }

            // Register longest words (without punctuation)

            if (
                longestWordsWithPunctuation.length < LONGEST_WORDS_ANALYSIS_COUNT ||
                longestWordsWithPunctuation[longestWordsWithPunctuation.length - 1].length < length
            ) {
                if (!LONGEST_WORD_URL_FILTER.test(word)) {
                    longestWordsWithPunctuation.push({
                        length: length,
                        word
                    });

                    longestWordsWithPunctuation.sort((a, b) => b.length - a.length);

                    if (longestWordsWithPunctuation.length > LONGEST_WORDS_ANALYSIS_COUNT) {
                        longestWordsWithPunctuation.pop();
                    }
                }
            }
        }

        // Register city mentions

        for (const city of cityReferences) {
            const matches = [...stripped.matchAll(city.regex)].length;

            if (matches > 0) {
                city.articleCount += 1;
                city.referenceCount += matches;
            }
        }
    }

    const averageArticleLength = Math.round(totalCharacters / articleCount);

    const categories = Array.from(data.categories.values())
        .filter(category => Object.hasOwn(category, 'articles'))
        .sort((a, b) => b.articles.length - a.articles.length);

    const top25authorsWithArticlesInIssues = data.authors
        .map(author =>  ({ articleCount: author.articles.filter(article => !!article.issue).length, author }))
        .sort((a, b) => b.articleCount - a.articleCount)
        .slice(0, 25);

    cityReferences.sort((a, b) => b.referenceCount - a.referenceCount);

    const output = `
Artikelzahl aller Zeitschriften gesamt: ${articleCount}

Durchschnittliche Artikellänge: ${averageArticleLength} Zeichen
Kürzester Artikel: ${shortestArticle.length} Zeichen (${shortestArticle.article.title})
Längster Artikel: ${longestArticle.length} Zeichen (${longestArticle.article.title})
Gesamtzeichenzahl aller Artikel: ${totalCharacters} Zeichen

Artikelzahl nach Kategorie:
------
${categories.map(category => `${category.name}: ${category.articles.length} Artikel`).join('\n')}

Autor:innen mit den meisten veröffentlichen Beiträgen (Top 25):
------
${top25authorsWithArticlesInIssues.map(author => `${author.author.name} (${author.articleCount} Artikel)`).join('\n')}

Längste Worte (Top ${LONGEST_WORDS_ANALYSIS_COUNT}):
------
${longestWords.map(longestWord => `'${longestWord.word}' (${longestWord.length} Zeichen)`).join('\n')}

Längste Worte (mit Interpunktion) (Top ${LONGEST_WORDS_ANALYSIS_COUNT}):
------
${longestWordsWithPunctuation.map(longestWord => `'${longestWord.word}' (${longestWord.length} Zeichen)`).join('\n')}

Erwähnungen von Städten
------
${cityReferences.map(city => `${city.name}: ${city.referenceCount} Erwähnungen in ${city.articleCount} Artikeln`).join('\n')}
    `.trim();

    openTempFile('Allgemeine Statistiken.txt', output);
};
