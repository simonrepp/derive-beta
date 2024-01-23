# derive-beta

dérive Pulsar Plugin Beta

## sharp library compability notes

- The latest Pulsar release at the time of writing (Pulsar 1.113.0) ships with Node.js 14.
- sharp 0.33.0 dropped support for Node.js 14 and 16, requiring a minimum version of Node.js 18.17.0 (therefore we cannot use sharp 0.33.0+ yet)
- sharp 0.32.6 (last release in the 0.32 series) is compatible with Node.js 14 but requires libvips 8.14.5+, while Debian 12 only ships libvips 8.14.1 (therefore we do not use sharp 0.32.6 yet)
- sharp 8.31.3 (last release in the 0.31 series) is compatible with Node.js 14 and requires libvips 8.13.3+, and is thus supported on Debian 12 (therefore we use in on the main branch currently)
- We might still switch to an older sharp version if significant (numbers of) devices in our collective infrastructure need an earlier version

References:
- https://github.com/pulsar-edit/pulsar/blob/master/CHANGELOG.md
- https://sharp.pixelplumbing.com/changelog
- https://nodejs.org/en/about/previous-releases