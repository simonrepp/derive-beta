const layout = require('./layout.js');

module.exports = data => {
    const html = `
        <div>
            <div class="pagination">
                <form action="/suche/" class="search_searchform">
                    <div>
                        <input name="query" placeholder="Ihr Suchbegriff" type="search">

                        <button type="button" data-toggle-filters>
                            Filter
                        </button>
                        <button type="submit">
                            Suchen
                        </button>
                    </div>

                    <div class="search_filters">
                        <div class="search_filter"><span class="icon-checkbox-checked" data-section="zeitschrift"></span> Zeitschrift</div>
                        <div class="search_filter"><span class="icon-checkbox-checked" data-section="autorinnen"></span> Autor:innen</div>
                        <div class="search_filter"><span class="icon-checkbox-checked" data-section="bücher"></span> Bücher</div>
                        <div class="search_filter"><span class="icon-checkbox-checked" data-section="radio"></span> Radio</div>
                        <div class="search_filter"><span class="icon-checkbox-checked" data-section="texte"></span> Texte</div>
                    </div>
                </form>
            </div>
            <div class="search_info">
                Suchergebnisse für:<br>
                <h2 class="search_query"></h2>
            </div>
            <div class="search_results listings">
                Suche läuft ...
            </div>
        </div>
    `;

    return layout(data, html, { extraScript: 'search.js', title: 'Suche' });
};
