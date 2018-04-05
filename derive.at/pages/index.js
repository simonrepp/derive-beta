const layout = require('./layout.js');

module.exports = () => {
  const html = `
    <div class="feature-large">
      <img src=""/>

      <div>
        ABOGESCHENKSBUCH

        <h1>
          <a href="#">
            Title
          </a>
        </h1>

        Text
      </div>      IMAGE LEFT
    </div>

    <div class="feature-large">
      <img src=""/>

      <div>
        ABOGESCHENKSBUCH

        <h1>
          <a href="#">
            Title
          </a>
        </h1>

        Text
      </div>      IMAGE LEFT
    </div>
  `;

  return layout(html);
};
