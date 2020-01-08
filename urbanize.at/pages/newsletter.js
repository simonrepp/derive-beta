const layout = require('./layout.js');

// TODO: Replace current history step (= newsletter adress) with derive index on submit, so back button on next page leads to index instead of this page again

const PRESS_NEWSLETTER = {
  csrfToken: 'MTRkYzVlNzI3Mjc0ODA1ODMzZTRjNzU3NGViYjI3NDg4MmVlN2U2NDU3MjllMGI0ZTM3OWE0YWUzMDFlMzUzYQ==',
  keys: {
    city: 'w-field-field-71835-403698-537738-125386',
    country: 'w-field-field-71835-403698-537738-106942',
    email: 'w-field-field-71835-403698-537738-email',
    firstName: 'w-field-field-71835-403698-537738-106940',
    institution: 'w-field-field-71835-403698-537738-125387',
    lastName: 'w-field-field-71835-403698-537738-106941'
  },
  title: 'Presse-Newsletter Anmeldung',
  url: 'https://app.mailjet.com/widget/iframe/2fTc/iGD'
};

const PUBLIC_NEWSLETTER = {
  csrfToken: 'MzAzYTQyMDVlM2ZhZGY4OWQzYWIxYTg0NDE1MTNmNWQwYWY1YWUxOGRhZGE5MDVmYTRkMmUyODk0ZGI2YzJhYw==',
  keys: {
    city: 'w-field-field-71620-402641-537738-125386',
    country: 'w-field-field-71620-402641-537738-106942',
    email: 'w-field-field-71620-402641-537738-email',
    firstName: 'w-field-field-71620-402641-537738-106940',
    institution: 'w-field-field-71620-402641-537738-125387',
    lastName: 'w-field-field-71620-402641-537738-106941'
  },
  title: 'Newsletter Anmeldung',
  url: 'https://app.mailjet.com/widget/iframe/2fTc/iDa'
};

module.exports = (urbanize, audience) => {
  const newsletter = audience === 'press' ? PRESS_NEWSLETTER : PUBLIC_NEWSLETTER;

  const html = `
    <h1>
      ${newsletter.title}
    </h1>

    <form action="${newsletter.url}" method="post">
      <input type="hidden" id="csrf_token" name="csrf_token" value="${newsletter.csrfToken}">

      <div class="color_black margin_y_0_5">E-Mail</div>
      <input class="input_rect_white margin_y_0_5" name="${newsletter.keys.email}" required="required" type="email">

      <div class="color_black margin_y_0_5">Vorname</div>
      <input class="input_rect_white margin_y_0_5" name="${newsletter.keys.firstName}" required="required" type="text">

      <div class="color_black margin_y_0_5">Nachname</div>
      <input class="input_rect_white margin_y_0_5" name="${newsletter.keys.lastName}" required="required" type="text">

      <div class="color_black margin_y_0_5">Institution</div>
      <input class="input_rect_white margin_y_0_5" name="${newsletter.keys.institution}" type="text">

      <div class="color_black margin_y_0_5">Stadt/Ort</div>
      <input class="input_rect_white margin_y_0_5" name="${newsletter.keys.city}" required="required" type="text">

      <div class="color_black margin_y_0_5">Land</div>
      <input class="input_rect_white margin_y_0_5" name="${newsletter.keys.country}" required="required" type="text">

      <div class="color_black margin_y_2_0">
        <input id="checkbox_consent" name="w-preview-consent-checkbox" required="required" type="checkbox">
        <label class="slider_white" for="checkbox_consent">
          <span class="nub"></span>
        </label>

        Ich stimme dem Erhalt dieses Newsletters zu und weiß, dass ich mich jederzeit problemlos abmelden kann.
      </div>


      <div class="font_size_0_8 margin_y_2_0">
        Wir informieren mit unserem Newsletter ca. 1 - 2 x pro Monat über unsere
        Aktivitäten (Zeitschrift, Radio und URBANIZE!-Festival). Nach dem Wohnort/Land
        fragen wir, weil es uns ermöglicht z.B. Veranstaltungstipps gezielt an die
        Bewohner und Bewohnerinnen der jeweiligen Stadt/des Landes zu schicken. Der
        Newsletter kann jederzeit einfach abbestellt werden.
      </div>

      <button class="button_rect_white margin_y_0_5"
              onclick="if(!document.querySelector('#checkbox_consent').checked) { alert('Bitte dem Erhalt des Newsletters durch Aktivierung des Sliders im Formular zustimmen.'); }"
              type="submit">
        Abonnieren
      </button>
    </form>
  `;

  return layout(html, urbanize, { slim: true });
};
