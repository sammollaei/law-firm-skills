# Compatibility and evidence

Documentation checked October 14, 2026. A shared file format does not guarantee
identical tool access, permissions, model behavior, or task completion.

| Host | Delivery route | Evidence for this release |
|---|---|---|
| Claude Code | Native skill directory | Official route documented; isolated folder/asset checks. No live model run. |
| Codex | Native skill directory | Official route documented; isolated folder/asset checks. No live model run. |
| Grok Bot | Save supplied workflow as a private skill | Official saved-skill workflow documented. Account installation and execution untested. |
| Grok Build | Native skill directory | Official route documented; live discovery and execution untested. |
| Cursor | Native skill directory | Official route documented; live discovery and execution untested. |
| Gemini CLI | Native skill directory | Official route documented; live discovery and execution untested. |
| GitHub Copilot | Project skill directory on supported surfaces | Official route documented; live discovery and execution untested. |
| OpenClaw | Workspace skill directory | Official route documented; live discovery and execution untested. |
| Other chat assistants | Instructions plus supplied inputs | Portable text fallback; not a native-installation or integration claim. |

See [installation](installation.md) for the official sources and verification
steps. The library has not been tested end to end on every platform.

## Capability limits

- Instructions and examples can be read without connectors. Conclusions are
  bounded by the evidence the user supplies and the host can access.
- Live inbox/task/calendar/CRM work requires the user's own approved integrations.
  None are bundled, provisioned, or linked to the author's systems.
- Video review requires readable speech and sufficient visual evidence for
  the question. The portable watch skill bundles no download/transcription runtime.
- The local profit calculator uses USD cents and a normalized case cohort.
  The scale calculator uses explicit currencies, units, and scenario assumptions.
  Their offline tests establish arithmetic behavior, not a financial forecast.
- A standalone prompt contains Markdown references and notices. It does not
  grant code execution, install script files, or provide service credentials.

## Verification labels

"Structurally checked" means metadata, local links, licenses, and package
contents passed local checks. "Calculator tested" means deterministic code was
run against fictional inputs and boundary cases. "Author walkthrough" means
the workflow was reviewed against a scenario by its preparer.

Only a real host run with an observed outcome can be called "live tested."
No live platform execution, real mailbox actions, client-data processing, or
published GitHub release is claimed by these local checks.
