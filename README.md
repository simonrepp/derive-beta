# derive-beta

dérive Atom Plugin Beta

## Install note

In the course of the atom discontinuation, apm seems to have been left in a
state of abandonement, meaning that package publishing currently does not
work, or only randomly works (see issues at
https://github.com/atom/apm/issues).

> Possible solution. Install using git repo if available like:
> `apm install simonrepp/derive-beta`

https://github.com/atom/atom/issues/25417#issuecomment-1103834423

Also see https://github.com/atom/apm/pull/518

## Dependency note

The `sharp` dependency at present **must not** be updated past `0.20.8` because client computers currently don't support it.
As sharp `0.20.8` however does not build on more modern machines, for testing it might need to be bumped to `0.25.4` on a branch
so the plugin can be installed (`apm install`) and tested. Take care not to publish the bumped version though.

## Atom note

The last conserved `atom` binary/release on arch now only runs with `./atom --no-sandbox` invocation.