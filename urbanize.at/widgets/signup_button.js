module.exports = (event, date) => {
  if(!event.signupLink)
    return '<span class="color_accent">Keine Anmeldung notwendig</span>';

  if(date.fullyBooked)
    return '<span class="color_accent">Veranstaltung bereits ausgebucht</span>';

  return `
    <a class="rounded_rect button_rect_accent" href="${event.signupLink}" target="_blank">
      Anmeldung
    </a>
  `;
};
