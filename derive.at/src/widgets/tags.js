module.exports = (tags) => {
  if(tags && tags.length > 0) {
    return `
      <div>
        <strong>Tags</strong>

        <div>
          ${tags.map(tag => `
            <a class="generic__smaller-text" href="/tags/${tag}/">${tag}</a>
          `)}
        </div>
      </div>
    `;
  } else {
    return '';
  }
};