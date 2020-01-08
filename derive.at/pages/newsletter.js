const layout = require('./layout.js');

// TODO: Replace current history step (= newsletter adress) with derive index on submit, so back button on next page leads to index instead of this page again

const NEWSLETTER = {
  csrfToken: 'MGJmZWQwYzE1Y2I0ZWEzNjkyZGQ3YjE5MWY5MGZjYzNmNTNiNTIzMGZjZTI2MmJlYmJlZTU0MjA1MmFlYTFhNw==',
  keys: {
    city: 'w-field-field-78037-434182-537738-125386',
    country: 'w-field-field-78037-434182-537738-106942',
    email: 'w-field-field-78037-434182-537738-email',
    firstName: 'w-field-field-78037-434182-537738-106940',
    institution: 'w-field-field-78037-434182-537738-125387',
    lastName: 'w-field-field-78037-434182-537738-106941'
  },
  title: 'Newsletter Anmeldung',
  url: 'https://app.mailjet.com/widget/iframe/2fTc/kiF'
};

module.exports = data => {
  const html = `
    <h1>
      ${NEWSLETTER.title}
    </h1>

    <form action="${NEWSLETTER.url}" method="post">
      <input type="hidden"
             id="csrf_token"
             name="csrf_token"
             value="${NEWSLETTER.csrfToken}">

      <div class="newsletter_label">E-Mail</div>
      <input class="newsletter_input"
             name="${NEWSLETTER.keys.email}"
             placeholder="Z.b. john.smith@example.com"
             required="required"
             type="email">

      <div class="newsletter_label">Vorname</div>
      <input class="newsletter_input"
             name="${NEWSLETTER.keys.firstName}"
             placeholder="Z.b. John"
             required="required"
             type="text">

      <div class="newsletter_label">Nachname</div>
      <input class="newsletter_input"
             name="${NEWSLETTER.keys.lastName}"
             placeholder="Z.b. Smith"
             required="required"
             type="text">

      <div class="newsletter_label">Institution</div>
      <input class="newsletter_input"
             name="${NEWSLETTER.keys.institution}"
             placeholder="Optional, z.b. Universität Wien"
             type="text">

      <div class="newsletter_label">Stadt/Ort</div>
      <input class="newsletter_input"
             name="${NEWSLETTER.keys.city}"
             placeholder="Z.b. Mannheim"
             required="required"
             type="text">

      <div class="newsletter_label">Land</div>
      <input class="newsletter_input"
             name="${NEWSLETTER.keys.country}"
             placeholder="Z.b. Schweiz"
             required="required"
             type="text">

      <div class="newsletter_label">
        <input class="newsletter_checkbox"
               id="checkbox_consent"
               name="w-preview-consent-checkbox"
               required="required"
               type="checkbox">

        <span class="icon-checkbox"
              onclick="
                if(document.querySelector('#checkbox_consent').checked) {
                  this.classList.remove('icon-checkbox-checked');
                  this.classList.add('icon-checkbox');
                  document.querySelector('#checkbox_consent').checked = false;
                } else {
                  this.classList.remove('icon-checkbox');
                  this.classList.add('icon-checkbox-checked');
                  document.querySelector('#checkbox_consent').checked = true;
                }
              ">
        </span>

        Ich stimme dem Erhalt dieses Newsletters zu und weiß, dass ich mich jederzeit problemlos abmelden kann.
      </div>


      <div class="newsletter_label">
        Wir informieren mit unserem Newsletter ca. 1 - 2 x pro Monat über unsere
        Aktivitäten (Zeitschrift, Radio und URBANIZE!-Festival). Nach dem Wohnort/Land
        fragen wir, weil es uns ermöglicht z.B. Veranstaltungstipps gezielt an die
        Bewohner und Bewohnerinnen der jeweiligen Stadt/des Landes zu schicken. Der
        Newsletter kann jederzeit einfach abbestellt werden.
      </div>

      <button class="newsletter_button"
              onclick="if(!document.querySelector('#checkbox_consent').checked) { alert('Bitte dem Erhalt des Newsletters durch Anklicken der Checkbox im Formular zustimmen.'); }"
              type="submit">
        Abonnieren
      </button>
    </form>
  `;

  return layout(data, html, { title: NEWSLETTER.title });
};
