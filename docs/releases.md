# Release notes

## v0.3.1

Claude directory edition. The directory accepts only Markdown, text, JSON, YAML,
and image files from publishers it has not verified, so this release removes 14
files from v0.3.0.

- Removed: the Node.js calculators and their tests from profit-plan and
  scale-plan, the website sources, the SVG icon, and the release tools.
- Profit-plan and scale-plan now show their arithmetic in the open from an
  expanded calculation contract, with the same formulas and failed-check rules.
  Calculation accuracy now depends on the assistant and on review of the shown
  work, not on tested code.
- The other 17 skills change only their version number.

v0.3.0 is unchanged and keeps the calculators, website, and release tools.

## v0.3.0

18 workflows plus guided setup, by Sam Mollaei under MIT.

- Add meeting-prep: a short pre-call brief with current commitments, verified
  numbers, and decisions to obtain. Connected systems stay read-only.
- Add verify: explicit claims, primary evidence, an approved packet for a fresh
  independent review, and passed/blocked/unverified/unavailable outcomes. No
  automatic CLI launcher or repository access is bundled.
- Morning: classify tasks and messages, verify stale premises before escalation,
  and preserve outstanding commitments when resolving conversations.
- Meeting: compare the prep brief with the actual decisions; bind approvals to
  action IDs, source revisions, recipients, and channels; reconcile receipts.
- Email: preserve literal amounts and dates, and protect newer drafts against
  replacement with stale approved text.
- Evaluate-team: align windows and peer coverage, count work by completion,
  and publish the exact reviewed artifact.
- Watch: distinguish local transcription from cloud analysis, require approved
  processing destinations, and verify material transcript details.
- Update package metadata, installation guidance, privacy disclosure, and the
  public catalog. Add nine fictional regression cases.

Installation and connected-source behavior are separate: users must supply
permitted material or configure their own authorized tools. See
[compatibility](compatibility.md) for actual test evidence and limits.

## v0.2.1

Added Claude directory metadata to the 16-workflow collection plus setup.
Historical host checks remain dated in the compatibility document.
