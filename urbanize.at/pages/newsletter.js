const layout = require('./layout.js');

const PUBLIC_URL = 'https://app.mailjet.com/widget/iframe/2fTc/iDa';
const PRESS_URL = 'TODO'; // TODO: Setup press newsletter interface through mailjet (possibly needs custom csrf_token below too?)

module.exports = (urbanize, audience) => {
  const html = `

    <h1>
      ${audience === 'press' ? 'Presse-Newsletter-Anmeldung' : 'Newsletter-Anmeldung'}
    </h1>

    <form action="${audience === 'press' ? PRESS_URL : PUBLIC_URL}" method="post">
      <input type="hidden" id="csrf_token" name="csrf_token" value="MzAzYTQyMDVlM2ZhZGY4OWQzYWIxYTg0NDE1MTNmNWQwYWY1YWUxOGRhZGE5MDVmYTRkMmUyODk0ZGI2YzJhYw==">

      <div class="color_black margin_y_0_5">E-Mail</div>
      <input class="input_rect_white margin_y_0_5" name="w-field-field-71620-402641-537738-email" required="required" type="email">

      <div class="color_black margin_y_0_5">Vorname</div>
      <input class="input_rect_white margin_y_0_5" name="w-field-field-71620-402641-537738-106940" required="required" type="text">

      <div class="color_black margin_y_0_5">Nachname</div>
      <input class="input_rect_white margin_y_0_5" name="w-field-field-71620-402641-537738-106941" required="required" type="text">

      <div class="color_black margin_y_0_5">Institution</div>
      <input class="input_rect_white margin_y_0_5" name="w-field-field-71620-402641-537738-125387" type="text">

      <div class="color_black margin_y_0_5">Stadt/Ort</div>
      <input class="input_rect_white margin_y_0_5" name="w-field-field-71620-402641-537738-125386" required="required" type="text">

      <div class="color_black margin_y_0_5">Land</div>
      <input class="input_rect_white margin_y_0_5" name="w-field-field-71620-402641-537738-106942" required="required" type="text">

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

      <button class="button_rect_white margin_y_0_5" type="submit">Abonnieren</button>
    </form>
  `;

  return layout(html, urbanize, { slim: true });
};
