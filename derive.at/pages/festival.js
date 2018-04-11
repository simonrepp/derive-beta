const layout = require('./layout.js'),
      share = require('../widgets/share.js');

const festivals = [
  { image: '/images/urbanize-2011.jpg', url: 'https://2011.urbanize.at' },
  { image: '/images/urbanize-2012.png', url: 'https://2012.urbanize.at' },
  { image: '/images/urbanize-2013.jpg', url: 'https://2013.urbanize.at' },
  { image: '/images/urbanize-2014.jpg', url: 'https://2014.urbanize.at' },
  { image: '/images/urbanize-2015.jpg', url: 'https://2015.urbanize.at' },
  { image: '/images/urbanize-2016.png', url: 'https://2016.urbanize.at' },
  { image: '/images/urbanize-2017.jpg', url: 'https://2017.urbanize.at' }
];

module.exports = data => {
  const html = `
    <div class="feature">

      <div class="feature__image">
        <img src="${festivals[festivals.length - 1].image}"/>
      </div>

      <div class="feature__text">
        <h1>urbanize!</h1>
        <h2>Int. Festival für urbane Erkundungen</h2>

        <span>
          Mit Vorträgen und Diskussionen, Workshops und Case Studies, künstlerischen Interventionen, Filmen und Stadterkundungen lädt urbanize! gemeinsam mit der Planbude zur Erkundung von Strategien, Mustern und Modellen einer selbstbestimmten Ko-Produktion von Stadt erstmals nach Hamburg (23.9.-2.10.) und Wien (12.10.-16.10.). Auf der Tagesordnung steht nicht weniger, als die Neuerfindung der Stadt durch die Vielen: Beschleunigt die Aneignung! Intensiviert die Beteiligung! Multipliziert die Plattformen des Austauschs! Los geht‘s! Join us!
        </span>

        <div class="generic__margin-vertical">
          <a href="https://urbanize.at">urbanize.at</a>
        </div>

        ${share('urbanize! Festival', 'https://derive.at/festival/')}
      </div>
    </div>

    <h2 class="generic__center-aligned">
      Festivals der letzten Jahre
    </h2>

    <div class="tiles">
      ${festivals.map(festival => `
        <div class="tile tile--festival">
          <a href="${festival.url}" target="_blank">
            <img src="${festival.image}" />
          </a>
        </div>
      `).join('')}
    </div>
  `;

  return layout(data, html, { activeSection: 'Festival', title: 'urbanize! Festival' });
};
