module.exports = data => {
    data.articles.forEach(article => {
        if(article.draft) { data.articles.delete(article.sourceFile); }
    });

    data.books.forEach(book => {
        if(book.draft) { data.books.delete(book.sourceFile); }
    });

    data.features.forEach(feature => {
        if(feature.draft) { data.features.delete(feature.sourceFile); }
    });

    data.issues.forEach(issue => {
        if(issue.draft) { data.issues.delete(issue.sourceFile); }
    });

    data.pages.forEach(page => {
        if(page.draft) { data.pages.delete(page.sourceFile); }
    });

    data.players.forEach(player => {
        if(player.draft) { data.players.delete(player.sourceFile); }
    });

    data.programs.forEach(program => {
        if(program.draft) { data.programs.delete(program.sourceFile); }
    });

    for(const event of Object.values(data.urbanize.events)) {
        if(event.hasOwnProperty('draft')) {
            delete data.urbanize.events[event.sourceFile];
        }
    }

    for(const page of Object.values(data.urbanize.pages)) {
        if(page.hasOwnProperty('draft')) {
            delete data.urbanize.pages[page.sourceFile];
        }
    }
};
