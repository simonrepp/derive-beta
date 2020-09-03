module.exports = (event, date) => {
  if(!event.signupLink)
    return '<span class="color_accent">Keine Anmeldung notwendig</span>';

  if(date.fullyBooked)
    return '<span class="color_accent">Anmeldung bereits ausgebucht</span>';

  return `
    <a class="button_rect_accent" href="${event.signupLink}">
      Anmeldung
    </a>
  `;
};
