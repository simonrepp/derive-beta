module.exports = (event, date) => {
  if(!event.signupLink)
    return '<span></span>';
    // Removed this notice for urbanize 2023, keeping it for maybe bringing it back:
    // return '<span class="color_accent">Keine Anmeldung notwendig</span>';

  if(date.fullyBooked)
    return '<span class="color_purple">Veranstaltung bereits ausgebucht</span>';

  return `
    <a class="rounded_rect button_rect_purple" href="${event.signupLink}" target="_blank">
      Anmeldung
    </a>
  `;
};
