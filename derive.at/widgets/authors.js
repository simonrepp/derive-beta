exports.authors = authors => authors.length > 0 ? `
    <div>
        ${authors.map(author =>
            `<a href="/autorinnen/${author.permalink}/">${author.name}</a>`
        ).join(', ')}
    </div>
`:'';
