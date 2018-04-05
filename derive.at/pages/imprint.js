const layout = require('./layout.js');

module.exports = () => {
  const html = `
    <div>
      FOTO
      Fotocredit

      <h1>Impressum</h1>

      <strong>Medieninhaber:</strong>

      dérive - Verein für Stadtforschung
      Mayergasse 5/12
      1020 Wien

      Vorstand:
      Christoph Laimer und Elke Rauth

      ZVR-Zahl: 240986007
      Tel.: +43 (0) 1 946 35 21
      E-Mail: mail@derive.at
      UID Nr.: ATU69169712

      Grundlegende Richtung
      derive.at ist eine interdisziplinäre Plattform zum Thema Stadtforschung.

      Vereinszweck
      Zweck des Vereines ist die Ermöglichung und Durchführung von Forschungen und wissenschaftlichen Tätigkeiten zu den Themen Stadt und Urbanität und allen damit zusammenhängenden Fragen. Besondere Berücksichtigung sollen dabei inter- und transdisziplinäre Ansätze finden.

    </div>
  `;

  return layout(html, { title: 'Kontakt / Impressum' });
};
