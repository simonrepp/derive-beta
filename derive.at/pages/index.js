const layout = require('./layout.js');

const DEFAULT_LINES = 3;

module.exports = data => {
    const sortedFeatures = Array.from(data.features.values()).sort((a, b) => a.position - b.position);

    // The first feature is by convention always landscape, and the next magazine issue
    const topFeature = sortedFeatures.shift();

    // TODO: Solve this cleanly through a field in the .eno files (and move the data linking to a prior step (connect.js?))
    let topFeatureIssue = topFeature.url.match(/derive\.at\/zeitschrift\/([0-9]+)\/$/);
    if (topFeatureIssue) {
        const topFeatureIssueNumber = topFeatureIssue[1];
        topFeatureIssue = data.issuesDescending.find(issue => issue.number === topFeatureIssueNumber);
    }

    // During urbanize we sometimes have a "secondary top feature", the festival
    let secondaryFeature;
    if (sortedFeatures[0].type === 'landscape') {
        secondaryFeature = sortedFeatures.shift();
    }

    let lastSpan = 4;
    let lastType = 'landscape';
    let lines = 0;
    const otherFeatures = sortedFeatures
        .map(feature => {
            const extra = (lines >= DEFAULT_LINES ? 'extra' : '');
            const result = { extra, feature, lastSpan, lastType };

            if (feature.type === 'landscape') {
                lastSpan = 4;
                lastType = 'landscape';
            } else if (feature.type === 'portrait') {
                lastSpan = (lastSpan === 4 ? 2 : 4);
                lastType = 'portrait';
            } else /* if (feature.type === 'card') */ {
                lastSpan = (lastSpan === 4 ? 1 : lastSpan + 1);
                lastType = 'card';
            }

            if (lastSpan === 4) {
                lines += 1;
            }

            return result;
        });

    const extraButton = lines > DEFAULT_LINES;

    const html = `
        <div class="top_feature">
            <div class="feature_${topFeature.type} feature_split">
                <a href="${topFeature.url}">
                    <img src="${topFeature.image.written}">
                </a>
                <div class="feature_text">
                    ${topFeature.header ? `
                        <div class="subheading">
                            ${topFeature.header}
                        </div>
                    `:''}

                    <div class="big_heading">
                        ${topFeature.url ? `<a href="${topFeature.url}">${topFeature.title}</a>` : topFeature.title}
                    </div>

                    ${topFeature.text ? topFeature.text.converted : ''}

                    ${topFeatureIssue ? `
                        <div class="call_out_buttons_spaced font_size_1_1">
                            <a class="call_out_button inverse" href="/zeitschrift/${topFeatureIssue.permalink}">
                                Vorschau
                            </a>
                            <a class="call_out_button inverse" href="${topFeatureIssue.shopLink}">
                                Heft kaufen
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${secondaryFeature ? `
                <div class="feature_${secondaryFeature.type} feature_split">
                    <a href="${secondaryFeature.url}">
                        <img src="${secondaryFeature.image.written}">
                    </a>
                    <div class="feature_text">
                        ${secondaryFeature.header ? `
                            <div class="subheading">
                                ${secondaryFeature.header}
                            </div>
                        `:''}

                        <div class="big_heading">
                            ${secondaryFeature.url ? `<a href="${secondaryFeature.url}">${secondaryFeature.title}</a>` : secondaryFeature.title}
                        </div>

                        ${secondaryFeature.text ? secondaryFeature.text.converted : ''}
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="statement">
            <span>
                dérive vermittelt Wissen aus Stadtforschung, Kunst und Aktivismus,<br>
                engagiert sich für die Demokratisierung der urbanen Gesellschaft<br>
                und die Stärkung der kritischen Öffentlichkeit.
            </span>
        </div>
        <div class="features">
            <div class="feature_card feature_split feature_special">
                <a href="https://shop.derive.at/collections/einzelpublikationen/pdf">
                    <div class="text_overlay">
                        <div>
                            <strong>Kiosk</strong>
                            Einzelhefte &amp; Abos
                        </div>
                    </div>
                    <div class="tone_overlay"></div>
                    <img src="/cards/city.jpg">
                </a>
            </div>

            <hr class="span_1 span_card">

            <div class="feature_card feature_split feature_special">
                <a href="https://shop.derive.at/products/probeheft">
                    <div class="text_overlay">
                        <div>
                            <strong>Probeheft</strong>
                            Gratis downloaden
                        </div>
                    </div>
                    <div class="tone_overlay"></div>
                    <img src="/cards/tracks.jpg">
                </a>
            </div>

            <hr class="span_2 span_card">

            <div class="feature_card feature_split feature_special">
                <a href="https://video.derive.at/">
                    <div class="text_overlay">
                        <div>
                            <strong>Videoarchiv</strong>
                            Vorträge &amp; Streifzüge
                        </div>
                    </div>
                    <div class="tone_overlay"></div>
                    <img src="/cards/people.jpg">
                </a>
            </div>

            <hr class="span_3 span_card">

            <div class="feature_card feature_split feature_special">
                <a href="https://derive.at/newsletter/">
                    <div class="text_overlay">
                        <div>
                            <strong>Newsletter</strong>
                            Abonnieren
                        </div>
                    </div>
                    <div class="tone_overlay"></div>
                    <img src="/cards/streets_trees.jpg">
                </a>
            </div>

            ${otherFeatures.map(({feature, extra, lastSpan, lastType}) => `
                <hr class="${extra} span_${lastSpan} span_${lastType}">

                <div class="${extra} feature_${feature.type} feature_split">
                    <a href="${feature.url}">
                        <img src="${feature.image.written}">
                    </a>
                    <div class="feature_text">
                        ${feature.header ? `<strong>${feature.header}</strong>`:''}

                        <div class="heading">
                            ${feature.url ? `<a href="${feature.url}">${feature.title}</a>` : feature.title}
                        </div>

                        ${feature.text && feature.type !== 'card' ? `<div>${feature.text.converted}</div>` : ''}

                        ${feature.url && feature.type !== 'card' && feature.buttonText ? `
                            <a class="call_out_button" href="${feature.url}" ${feature.externalUrl ? 'target="_blank"' : ''}>
                                ${feature.buttonText}
                            </a>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
            ${extraButton ? `
                <hr class="span_extra">
                <button class="show_extra_button">
                    Weitere Artikel laden
                </button>
            ` : ''}
        </div>
    `.trim();

    return layout(data, html);
};
