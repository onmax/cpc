# cpnow

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]

Copy folders contents and from github into your clipboard ready for LLMs.

```bash
npx cpnow ./src # pnpx cpnow
```

Or with GitHub:

```bash
npx cpnow gh:onmax/cpnow
```

> The CLI by default will ignore files that are defined in `.gitignore` files along with other commonly folders not used for code

## Installation in your machine

```bash
npm install -g cpnow
```

> If you think `cpnow` is long, you can always use an aliad in your `~/.bashrc` or `~/.zshrc` file like `alias cpc='npx cpnow'`

## Flags

### `-h, --help`

Displays help information.

### `-v, --version`

Displays version information.

### `-i <paths>`

Ignores the files/paths passed as arguments.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/cpnow?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/cpnow
[npm-downloads-src]: https://img.shields.io/npm/dm/cpnow?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/cpnow
[bundle-src]: https://img.shields.io/bundlephobia/minzip/cpnow?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=cpnow
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/cpnow
