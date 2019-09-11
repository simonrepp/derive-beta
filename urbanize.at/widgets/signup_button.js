module.exports = (event, date) => {
  if(!event.signupEmail)
    return '<span class="color_pink">Keine Anmeldung notwendig</span>';

  if(date.fullyBooked)
    return '<span class="color_pink">Anmeldung bereits ausgebucht</span>';

  return `
    <a class="button_rect_pink"
       href="mailto:${event.signupEmail}?subject=${encodeURIComponent(`Anmeldung für ${event.title}, ${date.date}, ${date.time}`)}">
      Anmeldung
    </a>
  `;
};
