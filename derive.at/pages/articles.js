const articleFeature = require('../widgets/articles/feature.js');
const layout = require('./layout.js');
const panel = require('../widgets/articles/panel.js');

module.exports = (data, pagination) => {
  const { articles, featured } = pagination;

  const html = `
    ${articleFeature(featured)}

    <div class="pagination">
      ${data.articlesPaginated.map(paginationIterated => `
        <a ${paginationIterated === pagination ? 'class="pagination--active"' : ''} href="/texte/${paginationIterated.label}/">${paginationIterated.label}</a>
      `).join(' / ')}
    </div>

    <div>
      ${articles.map(panel).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Texte', title: 'Texte' });
};
