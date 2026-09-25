# tmc-site

Source of the public website at https://tmc.ircminichat.party, deployed on Cloudflare Pages.

The page is static. Version number and download links are not written here by hand at runtime:
`index.html` asks the GitHub releases API for the latest release of `unouidol/TwitchMiniChat`
and fills every `data-tmc-version` element with its tag. The download buttons point at
`releases/latest/download/<asset>`, so they follow the newest release on their own.

The version printed in the HTML is only the fallback shown before that request answers, or
when JavaScript is unavailable. It does not update itself: raise it in the same step that
tags a release, together with `versionName` in the app.

Files:

- `index.html` — the whole landing page, styles excluded
- `styles.css`
- `tmc-icon.png`
- `downloads/TMC-Visual-Guide.pdf` — the illustrated guide the page links

This repository is the source of truth. The site was originally published by uploading a zip
by hand in the Cloudflare dashboard; that is what this repository replaces.
