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

const PRESS_NEWSLETTER = {
  title: 'Presse-Newsletter Anmeldung',
  url: 'https://h8z6.mjt.lu/wgt/h8z6/5ng/form?c=75190393'
};

const PUBLIC_NEWSLETTER = {
  title: 'Newsletter Anmeldung',
  url: 'https://h8z6.mjt.lu/wgt/h8z6/5nv/form?c=0d026ce5'
};

module.exports = (urbanize, audience) => {
    const newsletter = audience === 'press' ? PRESS_NEWSLETTER : PUBLIC_NEWSLETTER;

    const html = `
        <h1>${newsletter.title}</h1>
        <iframe data-w-type="embedded" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${newsletter.url}" width="100%"></iframe>
        <script type="text/javascript" src="https://app.mailjet.com/pas-nc-embedded-v1.js"></script>
    `.trim();

    return layout(html, urbanize, { slim: true });
};
