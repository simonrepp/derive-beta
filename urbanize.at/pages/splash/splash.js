import Helmet from 'react-helmet';
import Link from 'gatsby-link';
import React from 'react';

import './splash.scss';
import sujet from './sujet.png';

module.exports = () =>
  <div>
    <Helmet>
      <title>
        ur6anize! 2.-11.Oktober 2015, Wien
      </title>
    </Helmet>

    <a class="background link"
          href="/page/about/">
      <img alt="ur6anize! - Do It Together"
             src={sujet}
             class="sujet" />
    </a>
  </div>
;
