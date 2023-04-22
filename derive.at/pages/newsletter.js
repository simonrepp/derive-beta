const layout = require('./layout.js');

// Newsletter Anmeldung
//
// E-Mail (email)
// z.b. alice@example.com
//
// Vorname (firstName)
// z.b. Alice
//
// Nachname (name)
// z.b. Smith
// 
// Institution (institution)
// Optional, z.b. Universität Wien
// 
// Stadt/Ort (stadt)
// z.b. Wien
// 
// Land (country)
// z.b. Österreich
//
// [ ] Ich stimme dem Erhalt dieses Newsletters zu und weiß, dass ich mich jederzeit problemlos abmelden kann. 
//
// Wir informieren mit unserem Newsletter ca. 1 - 2 x pro Monat über unsere Aktivitäten (Zeitschrift, Radio und URBANIZE!-Festival). Nach dem Wohnort/Land fragen wir, weil es uns ermöglicht z.B. Veranstaltungstipps gezielt an die Bewohner und Bewohnerinnen der jeweiligen Stadt/des Landes zu schicken. Der Newsletter kann jederzeit einfach abbestellt werden.
//
// Abonnieren

const TITLE = 'Newsletter Anmeldung'

module.exports = data => {
    const html = `
        <h1>
            ${TITLE}
        </h1>

        <iframe data-w-type="embedded" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://h8z6.mjt.lu/wgt/h8z6/5k1/form?c=2fe6f761" width="100%"></iframe>
        <script type="text/javascript" src="https://app.mailjet.com/pas-nc-embedded-v1.js"></script>
    `;

    return layout(data, html, { title: TITLE });
};
