# Validation and packaging

Run from the collection root. These checks require Python 3.10+ and Node.js 18+,
use existing runtimes and standard libraries, and make no network calls:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 tools/check_release.py
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
- Sixteen single-skill ZIPs with local references, examples, and license notices.
- Sixteen portable workflow prompts with Markdown references embedded.
- A SHA-256 manifest for source files and generated artifacts.

The builder reads every archive member back and compares bytes with the source.
ZIP member dates and permissions are fixed for reproducible packaging. Prompts
do not contain executable helpers; use a full skill package for the calculators.

Inspect the generated files, not only their source. Do not add credentials,
private context, exports, historical logs, or client examples before packaging.
Do not reuse a private repository's history for a public release. Publication
requires the owner's approval of the exact reviewed contents; these tools do
not create a GitHub repository, push, upload, or alter visibility.
