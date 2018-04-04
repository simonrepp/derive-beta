module.exports = tags => {
  if(tags.length > 0) {
    return `
      <div>
        <strong>Tags</strong>

        <div>
          ${tags.map(tag => `
            <a class="generic__smaller-text" href="/tags/${tag.permalink}/">${tag.name}</a>
          `)}
        </div>
      </div>
    `;
  } else {
    return '';
  }
};
