# tmc-site

Source of the public website at https://tmc.ircminichat.party, deployed on Cloudflare Pages.

The page is static. Version number and download links are not written here by hand at runtime:
`index.html` asks the GitHub releases API for the latest release of `unouidol/TwitchMiniChat`
and fills every `data-tmc-version` element with its tag. The download buttons point at
`releases/latest/download/<asset>`, so they follow the newest release on their own.

The version printed in the HTML is only the fallback shown before that request answers, or
when JavaScript is unavailable. It does not update itself: raise it at publication, once the
GitHub release is out, and not earlier (the owner's ruling of 2026-11-13, recorded in the app
repository's `AGENTS.md`).

Until 2026-11-13 this said to raise it "in the same step that tags a release, together with
`versionName` in the app"; raised that early, it would advertise a version that nobody can
download for as long as the release takes to build, verify and test.

Files:

- `index.html` — the whole landing page, styles excluded
- `styles.css`
- `tmc-icon.png`
- `downloads/TMC-Visual-Guide.pdf` — the illustrated guide the page links

This repository is the source of truth. Since 2026-11-16 the site is a Cloudflare Pages project
connected to this repository, with production branch `main` and no build step, so a merge to
`main` is published automatically. Before that date the site was uploaded by hand in the
Cloudflare dashboard, and a merge here changed nothing online.
