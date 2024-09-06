exports.authors = authors => authors.length > 0 ? `
    <div class="authors">
        ${authors.map(author =>
            `<a href="/autorinnen/${author.permalink}/">${author.name}</a>`
        ).join(', ')}
    </div>
`:'';

exports.authorsSmall = authors => authors.length > 0 ? `
    <div class="smaller_font">
        ${authors.map(author =>
            `<a href="/autorinnen/${author.permalink}/">${author.name}</a>`
        ).join(', ')}
    </div>
`:'';
