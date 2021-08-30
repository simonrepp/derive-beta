# derive-beta

dérive Atom Plugin Beta

## Dependency notes

The `sharp` dependency at present **must not** be updated past `0.20.8` because client computers currently don't support it.
As sharp `0.20.8` however does not build on more modern machines, for testing it might need to be bumped to `0.25.4` on a branch
so the plugin can be installed (`apm install`) and tested. Take care not to publish the bumped version though.
