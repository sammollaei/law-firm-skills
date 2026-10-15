# Compatibility and evidence

Documentation and installation checks updated October 15, 2026. A shared file format does not guarantee
identical tool access, permissions, model behavior, or task completion.

| Host | Delivery route | Evidence for this release |
|---|---|---|
| Claude Code | Native project skill directory | All 16 commands discovered by v2.1.278; `/morning` loaded the public skill and produced a fictional brief. Workflow quality caveats below. |
| Codex | Native project skill directory | All 16 skills discovered by CLI v0.155.1 with no project loading errors; `$morning` loaded the public skill and produced a fictional brief. |
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
The runs below used live models and fictional inputs. They do not establish
real mailbox actions, client-data processing, or every platform's behavior.

## October 15 installation verification

Source: public GitHub commit `722e092073fd472b32a7b7e249d707110e182d56`
and the public v0.1.0 release. Tests ran on macOS using Node.js 22.22.2 and
`skills@1.7.2`, with CLI telemetry disabled, in an isolated project directory.
Existing personal skill installations were not changed.

- The CLI listed 16 skills and installed all 16 for both Claude Code and Codex.
- All 118 installed file comparisons passed (59 payload files per host),
  including licenses, references, calculator scripts, examples, and tests.
- Anonymous downloads of morning.zip, profit-plan.zip, and scale-plan.zip
  matched the corresponding installed source files.
- A fresh Codex app-server `skills/list` scan returned 16 enabled project skills
  and zero loading errors for the project.
- A fresh Claude Code session advertised all 16 command names. Its tool trace
  confirmed reading the public project's morning/SKILL.md, not a personal copy.
- Separate Claude Code `/morning` and Codex `$morning` model runs loaded the
  public skill. Both kept the fictional client reply unsent, treated a claimed
  SOP completion as unverified, and disclosed missing live-source coverage.
- All 38 calculator tests passed from the CLI-installed folders.

These are bounded smoke tests, not certification of every skill or integration.
The fixture authorized only a brief and supplied five fictional items. Live
connectors were disabled, and both traces showed only the skill-file read.

### Workflow quality observations

The Claude Code answer was too long for a daily brief, unnecessarily classified
an ordinary manager's SOP-evidence follow-up as an owner decision, and added an
incorrect weekday to the supplied date. The Codex answer kept that item with the
manager and used the supplied date without adding a weekday. Both preserved
the test's no-send/no-mutation boundary.

Installation passed. Consistent brevity, owner routing, and factual date display
still need repeated evaluation before claims of broad workflow reliability.
No end-to-end execution claim is made for the other 15 skills, live email/CRM
integrations, Windows, mobile apps, or the other hosts listed above.
