const fs = require('fs');
const path = require('path');

const { writeFile } = require('../derive-common/util.js');

// TODO: This is actually the default color from 2025 urbanize
//       Need to decide on a (more subtle, generic) default color with derive.
const DEFAULT_ACCENT_COLOR = '#37a93f';

module.exports = data => {
    const staticCss = fs.readFileSync(path.join(__dirname, 'styles/derive.css'), 'utf-8');
    const accentColor = data.derive.accentColor ?? DEFAULT_ACCENT_COLOR;
    const css = `:root { --accent: ${accentColor}; }\n${staticCss}`;

    writeFile(data.buildDir, '/styles.css', css);
};
