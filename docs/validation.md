# Validation and packaging

Run from the collection root. These checks require Python 3.10+ and Node.js 18+,
use existing runtimes and standard libraries, and make no network calls:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 tools/check_release.py
PYTHONDONTWRITEBYTECODE=1 python3 tools/test_release.py
node --test skills/profit-plan/scripts/calculate.test.mjs skills/scale-plan/scripts/calculate.test.mjs
```

The structural checker validates an explicit file allowlist, conservative
metadata, ASCII text, local links, skill-local references, and license presence.
It refuses unexpected files without reading their contents. This is useful
release containment, not a guarantee that arbitrary future prose is free of
private information. Review every changed file before publication.

The calculator tests cover missing versus zero data, duplicate IDs, incorrect
entity/units, unconfirmed receipts, incomplete cohorts, negative contribution,
capacity overload, cash delays, and invalid CLI input. They establish arithmetic
on fictional inputs, not the truth or completeness of real firm records.

Each skill README includes a fictional behavioral acceptance example. Review
the output against it in the intended host, including missing-access and
approval behavior. Static checks do not establish that a model follows a rule.
The [compatibility matrix](compatibility.md) distinguishes documented routes
from live runtime tests. No real mailbox or client-data actions are needed to
test these examples.

## Build local shareable files

Choose a new output directory outside the source tree:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 tools/build_release.py --output ../law-firm-skills-release
```

The builder refuses existing output, symlinks, unexpected files, and broken
local references. It packages only the explicit allowlist. Output contains:

- One complete source ZIP with no Git history.
- One plugin ZIP with plugin.json at its root, skills, assets, and notices.
- Seventeen single-skill ZIPs (16 workflows plus setup), preserving local resources.
- Seventeen portable workflow prompts with Markdown references embedded.
- A SHA-256 manifest for source files and generated artifacts.

The builder reads every archive member back and compares bytes with the source.
ZIP member dates and permissions are fixed for reproducible packaging. Prompts
do not contain executable helpers; use a full skill package for the calculators.

The export regression checks build twice and compare every output byte, verify
all standalone payloads, reject unexpected files without reading them, and
confirm that docs, evaluation logs, and maintainer tools stay out of the plugin ZIP.

## Host evaluation suite

The `evals/` directory has 31 fictional cases: one setup case and 30 across morning, meeting, follow-up,
playbook, and decide: ten direct, ten indirect, and ten negative/missing-data
requests. Claude Code 2.1.278 supports this native evaluation command:

```sh
claude plugin eval . --runs 1 --ablation with-without --no-publish --no-scaffold --trust-plugin --max-cost-usd 20 --output-dir /absolute/path/outside-this-repo
```

Run it only after reviewing this repository's suite. It makes paid model calls
using the operator's existing account. The native runner isolates sessions;
cases allow only reading and skill loading, with no real MCP servers or scaffold
scripts. Keep results outside this public source. The baseline comparison and
LLM graders are useful signals, not certification or proof of live integration.
Inspect traces to confirm actual skill selection, not just a plausible answer.

Also validate both Claude manifests with `claude plugin validate --strict` using
Claude Code 2.1.281 or later. Earlier versions warn about directory-only metadata
fields while still loading the plugin. See the [manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference#directory-listing-fields).
Then inspect the OpenAI package through native plugin discovery, and test install,
upgrade, and removal in disposable projects before wider distribution.

Inspect the generated files, not only their source. Do not add credentials,
private context, exports, historical logs, or client examples before packaging.
Do not reuse a private repository's history for a public release. Publication
requires the owner's approval of the exact reviewed contents; these tools do
not create a GitHub repository, push, upload, or alter visibility.
