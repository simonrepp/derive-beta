const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');

const { loadEno } = require('./derive-common/util.js');
const preview = require('./lib/preview.js');
const serve = require('./lib/serve.js');
const transform = require('./derive-common/transform.js');

const DEPLOY_DERIVE_AT = 'derive.at (Live Deployment)';
const DEPLOY_URBANIZE_AT = 'urbanize.at (Live Deployment)';
const PREVIEW_DERIVE_AT = 'derive.at (Lokale Seitenvorschau)';
const PREVIEW_URBANIZE_AT = 'urbanize.at (Lokale Seitenvorschau)';
const STAGE_DERIVE_AT = 'staging.derive.at (Test Deployment)';
const STAGE_URBANIZE_AT = 'staging.urbanize.at (Test Deployment)';

const data = {
    articles: new Map(),
    authors: [],
    bookAuthors: [],
    books: new Map(),
    booksPaginated: [],
    buildDir: path.resolve('public'),
    cache: new Map(),
    categories: new Map(),
    errors: [],
    features: new Map(),
    festival: null,
    issues: new Map(),
    media: new Map(),
    pages: new Map(),
    players: new Map(),
    programs: new Map(),
    programsPaginated: [],
    publishers: [],
    readableArticles: [],
    root: '/home/simon/Seafile/Website/', // TODO: Unhardcode
    screenings: new Map(),
    tags: new Map(),
    urbanize: {},
    warnings: []
};

// read derive.eno (config)
(() => {
    const configPath = path.join(data.root, 'derive.eno');

    if(fs.existsSync(configPath)) {
        const config = loadEno(data.root, 'derive.eno');
        const result = {};

        for(const siteSection of config.sections()) {
            const domain = siteSection.stringKey();

            if(domain === 'defaults') {
                siteSection.touch();
                continue;
            }

            result[domain] = {
                directory: siteSection.field('directory').requiredStringValue(),
                host: siteSection.field('host').requiredStringValue(),
                user: siteSection.field('user').requiredStringValue()
            };
        }

        data.config = result;
    } else {
        throw 'data.root misconfigured'
    }
})();

async function update(site, deploy = false) {
    console.log('Daten werden aktualisiert');

    await transform(data);

    if(data.errors.length > 0 || data.warnings.length > 0) {
        // TODO: Show errors
        // atom.workspace.open('atom://derive-documentation');
        console.log('TODO: Better show errors/warnings')
        console.log(data.errors);
        console.log(data.warnings);
    } else {
        console.log('Daten aktualisiert, keine Probleme gefunden!');
    }

    if (deploy) {

    } else {
        preview(data, site);
        serve(data);
    }
}

inquirer
    .prompt([
        {
            choices: [
                PREVIEW_DERIVE_AT,
                PREVIEW_URBANIZE_AT,
                STAGE_DERIVE_AT,
                STAGE_URBANIZE_AT,
                DEPLOY_DERIVE_AT,
                DEPLOY_URBANIZE_AT,
                'Exit'
            ],
            message: 'Choose an action:',
            name: 'action',
            type: 'list'
        }
    ])
    .then((answers) => {
        switch (answers.action){
            case DEPLOY_DERIVE_AT: update('derive.at', true); break;
            case DEPLOY_URBANIZE_AT: update('urbanize.at', true); break;
            case PREVIEW_DERIVE_AT: update('derive.at'); break;
            case PREVIEW_URBANIZE_AT: update('urbanize.at'); break;
            case STAGE_DERIVE_AT: update('staging.derive.at'); break;
            case STAGE_URBANIZE_AT: update('staging.urbanize.at'); break;
        }
    })
    .catch((error) => {
        if (error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
        } else {
            // Something else went wrong
        }
    });