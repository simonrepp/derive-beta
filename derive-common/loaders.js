const slug = require('speakingurl');
const { url } = require('enotype');

function boolean(value) {
    switch (value.toLowerCase()) {
        case 'ja': return true;
        case 'nein': return false;
        default: throw `Der Wert "Ja" oder "Nein" ist erforderlich, der momentane Wert ist aber "${value}".`;
    }
}
exports.boolean = boolean;

function featureType(value) {
    if (value === 'card' || value === 'landscape' || value === 'portrait') return value;
    throw `Ein Feature Typ ist erforderlich ('landscape', 'portrait' oder 'card'), der aktuelle Wert ${value} ist nicht erlaubt. (Gross/Kleinschreibung beachten!).`;
}
exports.featureType = featureType;

const ISSUE_REGEXP = /^\d+(?:\/\d+)?$/;
function issueNumber(value) {
    if (ISSUE_REGEXP.test(value)) return value;
    throw `Eine Ganzzahl ist erforderlich, bzw. bei Doppelausgaben zwei durch '/' getrennte Ganzzahlen, zum Beispiel '13' oder '40/41'`;
}
exports.issueNumber = issueNumber;

const PAGES_REGEXP = /^\d{2,3}(?:-\d{2,3})?(?:, \d{2,3}(?:-\d{2,3})?)?$|^Nur online$/;
function pagesInfo(value) {
    if (PAGES_REGEXP.test(value)) return value;
    throw `Erlaubte Formate für Seitenangaben sind: "01" / "13-14" / "23-42, 57-89" / "Nur online" `;
}
exports.pagesInfo = pagesInfo;

function path(value) {
    return { normalizedPath: value.replace(/^\//, '').normalize() }
}
exports.path = path;

function permalink(value) {
    const slugified = slug(value);

    if (value === slugified) {
        return value;
    } else {
        throw `Ein Permalink ist erforderlich, der momentane Wert "${value}" entspricht aber nicht den Anforderungen, eine erlaubte Variante wäre zum Beispiel: ${slugified}.`;
    }
}
exports.permalink = permalink;

function timeframe(value) {
    const match = value.match(/(\d\d):(\d\d)\s*(?:-\s*(\d\d):(\d\d))?/);

    if (!match) throw 'Der Zeitrahmen muss im Format "14:00" oder "14:00-16:00" angegeben werden.';

    const timeframe = {
        raw: value,
        start: {
            hours: parseInt(match[1]),
            minutes: parseInt(match[2])
        }
    };

    if (match[3] && match[4]) {
        timeframe.end = {
            hours: parseInt(match[3]),
            minutes: parseInt(match[4])
        };
    }

    return timeframe;
}
exports.timeframe = timeframe;

function urbanizeCategory(value) {
    if (value === 'Film-Kunst-Musik' || value === 'Stadt-Praxis' || value === 'Vortrag/Diskussion' || value === 'Workshop')
        return value;

    throw `Eine Urbanize Veranstaltungeskategorie ist erforderlich (eine von ${CATEGORIES.map(category => `'${category}'`).join(', ')}), '${value}' ist nicht erlaubt (auch Gross/Kleinschreibung beachten).`;
}
exports.urbanizeCategory = urbanizeCategory;

function urbanizeLanguage(value) {
    const lowercase = value.toLowerCase();

    if (lowercase === 'de' || lowercase === 'en') return lowercase;

    throw `Einer der beiden Sprachcodes - "de" oder "en" - ist erforderlich, "${value}" ist nicht vorgesehen.`;
}
exports.urbanizeLanguage = urbanizeLanguage;

function urlOrMailto(value) {
    try {
        return url(value);
    } catch { /* fall through to mailto check below */ }

    if (value.startsWith('mailto:')) return value;

    throw `Eine URL oder ein mailto:alice@example.com... Link ist erforderlich`;
}
exports.urlOrMailto = urlOrMailto;