# Validation

The v0.3.1 Claude directory edition contains Markdown, text, JSON, YAML, license,
and PNG files only. Run strict validation from the collection root with Claude
Code 2.1.281 or newer:

```sh
claude plugin validate --strict .
```

Then apply each financial skill's calculation contract to its fictional example
and confirm the figures the contract states. That checks arithmetic on fictional
inputs, not the truth or completeness of real firm records.

The website, release tooling, reproducible ZIP builder, and tested Node.js
calculators are not part of this edition. They remain in the
[v0.3.0 source](https://github.com/sammollaei/law-firm-skills/tree/v0.3.0) and on
the main branch.

Each skill README includes a fictional behavioral acceptance example. Review
the output against it in the intended host, including missing-access and
approval behavior. Static checks do not establish that a model follows a rule.
The [compatibility matrix](compatibility.md) distinguishes documented routes
from live runtime tests. No real mailbox or client-data actions are needed to
test these examples.

## Host evaluation suite

The `evals/` directory has 40 fictional cases: the original 31 setup and workflow cases,
plus nine v0.3.0 regressions covering the five updated workflows, meeting-prep,
and verify. They check source coverage, stale approvals, literal amounts,
confidential-media boundaries, and unavailable independent review.
Claude Code 2.1.281 supports this native evaluation command:

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
