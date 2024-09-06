# derive-beta

dérive Pulsar Plugin Beta

## sharp library compability notes

- The latest Pulsar release at the time of writing (Pulsar 1.113.0) ships with Node.js 14.
- sharp 0.33.0 dropped support for Node.js 14 and 16, requiring a minimum version of Node.js 18.17.0 (therefore we cannot use sharp 0.33.0+ yet)
- sharp 0.32.6 (last release in the 0.32 series) is compatible with Node.js 14 but requires libvips 8.14.5+, while Debian 12 only ships libvips 8.14.1 (therefore we do not use sharp 0.32.6 yet)
- sharp 0.31.3 (last release in the 0.31 series) is compatible with Node.js 14 and requires libvips 8.13.3+, and is thus supported on Debian 12, but on our oldest macOS 10.13.6 it does not work (therefore we do not use sharp 0.31.3 yet) 
- sharp 0.30.7 (last release in the 0.30 series) works on our oldest macOS 10.13.6 (therefore we use it on main currently)
- We could still switch to an older sharp version theoretically but right now there seems to be no need for it

References:
- https://github.com/pulsar-edit/pulsar/blob/master/CHANGELOG.md
- https://sharp.pixelplumbing.com/changelog
- https://nodejs.org/en/about/previous-releases

## enolib library compatibility notes

Enolib is now pure ESM, which Pulsar (respectively its node version) does not support at all,
so for the time being we stick with enolib 0.8.2.

## Release procedure

- Update the `version` field `in package.json`.
- Tag the latest commit in the format `v0.0.0`. (`git tag v0.0.0`)
- Run `git push --tags` to update tags on the remote as well

Finally publish the new version to the pulsar package registry:

```
ppm publish --tag v0.0.0
```