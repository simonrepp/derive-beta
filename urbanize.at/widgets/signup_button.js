module.exports = (event, date) => {
  if(!event.signupLink)
    return '<span class="color_pink">Keine Anmeldung notwendig</span>';

  if(date.fullyBooked)
    return '<span class="color_pink">Anmeldung bereits ausgebucht</span>';

  return `
    <a class="button_rect_pink" href="${event.signupLink}">
      Anmeldung
    </a>
  `;
};
