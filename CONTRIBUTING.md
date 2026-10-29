# Contributing

This project is published source with closed development. OSGeo Oceania
maintains it and publishes it so other regions can fork it and run their own
capability map.

| You want to                        | What happens                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Run the map for your region        | Fork it. Start with [docs/ADAPTING.md](docs/ADAPTING.md) and [docs/SETUP.md](docs/SETUP.md). |
| Ask a setup or adaptation question | Open an issue; questions are welcome. Answers are best-effort, with no support commitment.   |
| Report a security problem          | Do not open an issue; follow [SECURITY.md](SECURITY.md).                                     |
| Request a feature                  | Not accepted. Build it in your fork.                                                         |
| Open a pull request                | Not accepted; pull requests are closed with a pointer to this page.                          |

## Versioning

Releases are tagged and follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). The versioned
interface is the feed format and its validation rules, the environment
variables, the data file locations, and the Node.js and browser
requirements. Code structure is not part of it: forks edit the code.

## Checks

If you change your fork, these are the checks this repository runs before
every commit:

```bash
npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"
npx tsc --noEmit
npm run lint
npm run check:secrets
npm test
npm run build
```
