module.exports = tags => tags.length > 0 ? `
    <div class="vertical_margin">
        <strong>Tags</strong>
        <div class="smaller_font">
            ${tags.map(tag =>
                `<a href="/tags/${tag.permalink}/">${tag.name}</a>`
            ).join(', ')}
        </div>
    </div>
` : '';
