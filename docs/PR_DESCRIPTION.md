PR: docs: add javadoc generation scripts, javadoc page updates and CI workflow

Summary

This PR adds convenience scripts to generate aggregated Javadocs locally and a GitHub Actions workflow to build and publish Javadocs to GitHub Pages. It also adds a floating table-of-contents to the docs site, vendors required frontend assets, and cleans up IDE files from the repository index.

Changes included

- Add `docs/scripts/generate_javadocs.ps1` (PowerShell) and `docs/scripts/generate_javadocs.sh` (POSIX shell) to generate aggregated Javadocs and copy them to `docs/javadoc/apidocs`.
- Update `docs/javadoc/index.html` with instructions and links to run the scripts.
- Add `.github/workflows/generate_javadocs.yml` to build aggregated Javadocs and deploy the `docs` folder as a Pages artifact. The workflow is configured for manual dispatch by default.
- Add a compact floating TOC to `docs/index.html` and supporting CSS/JS.
- Vendor Font Awesome and Highlight.js under `docs/vendor/` and update includes to use local assets.
- Update `.gitignore` to ignore `.idea/` and remove `.idea` files from the index.

Notes for reviewers

- The shell script `docs/scripts/generate_javadocs.sh` is marked executable in the branch.
- The GitHub Action is configured to run on manual dispatch only to avoid generating artifacts on every push; once reviewed it can be re-enabled for `push` if desired.
- The vendor files increased the repository size but avoid external CDN dependencies for docs rendering.

How to test locally

- Generate javadocs locally (requires Maven and JDK):
  - PowerShell:
    PowerShell -ExecutionPolicy Bypass -File .\docs\scripts\generate_javadocs.ps1
  - Bash:
    ./docs/scripts/generate_javadocs.sh

- Serve the `docs` folder locally and verify the `javadoc/apidocs/index.html` if generated:
  python -m http.server --directory docs 8000
  # open http://localhost:8000/javadoc/apidocs/index.html

Request

Please review the changes and, if acceptable, merge the `docs/javadocs` branch into `main`. If you want the workflow to run automatically on push to `main`, I can update the workflow triggers accordingly.

