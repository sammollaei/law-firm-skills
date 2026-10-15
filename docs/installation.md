# Installation

Choose one workflow first. Inspect the chosen `skills/NAME/` directory before
installing. Download ZIPs from the [public release](https://github.com/sammollaei/law-firm-skills/releases/latest)
or use the version-pinned installer below.
Do not copy any personal working data into it.

## One-command install

Requires Node.js 22.20 or newer and a working Git installation. Check with
`node --version` and `git --version`. The installer is Vercel Labs' open-source
[skills CLI](https://github.com/vercel-labs/skills), pinned to the version tested
on October 15, 2026. It is separate from these skill instructions.

Open a terminal in a new or existing project directory, then choose a command:

```sh
# Preview the 16 available skills without installing them.
npx --yes skills@1.7.2 add sammollaei/law-firm-skills --list

# Install morning for Claude Code in this project.
npx --yes skills@1.7.2 add sammollaei/law-firm-skills --skill morning --agent claude-code --copy

# Install morning for Codex in this project.
npx --yes skills@1.7.2 add sammollaei/law-firm-skills --skill morning --agent codex --copy

# Install the complete collection for both hosts in this project.
npx --yes skills@1.7.2 add sammollaei/law-firm-skills --skill '*' --agent claude-code codex --copy
```

Run the host from this same project afterward. `--copy` preserves independent
copies, including licenses and supporting files. The commands omit the installer's
`-y` flag so a person can review its choices; `npx --yes` only accepts running the
specified CLI package. Review collisions before proceeding. The installer may
run non-interactively when launched by an agent, so inspect target folders first.

These commands install at project scope. Adding `--global` installs at personal
scope; do that only after checking for existing same-name skills. Do not use
`--all` as a shortcut: it also selects all supported agents.

The CLI reports anonymous install telemetry to skills.sh. Its supported opt-out
is `DISABLE_TELEMETRY=1` (or `DO_NOT_TRACK=1`); see its documentation. Local tests
used the opt-out. Manual ZIP installation does not require this CLI.

## Test morning

Start a fresh Claude Code or Codex session in the project. Confirm `morning`
appears in the skill selector. Use `/morning` in Claude Code or `$morning` in
Codex, followed by:

> Use only this fictional snapshot. Firm: Example Practice. Review window:
> October 15, 2026, 08:00-09:00 America/Los_Angeles; cutoff 09:00. Inbox M1:
> client requests a status reply, no send approval. Task T1: manager says the
> intake SOP is done, but no document is supplied. Calendar C1: intake meeting
> at 10:00. Live inbox, messaging, CRM and metrics are unavailable. Produce a
> brief only. Do not contact anyone, change tasks, or access real accounts.

Expected: it loads this collection's morning skill, keeps M1 unsent, treats T1
as unverified, distinguishes the future meeting from completed work, and names
missing coverage. Check the actual source path if another `morning` exists.
This test does not establish that live connectors are configured.

Troubleshooting:

- Skill missing: confirm the exact folder layout below and start the host in
  the directory where you installed it. Restart or use its supported refresh.
- Wrong morning skill: Claude Code gives personal skills precedence over project
  skills with the same name. Compare the source paths before changing either copy.
- Installer fails on an old Node version: use Node 22.20+ or the ZIP route.
- No inbox access: connect your own authorized tools or supply an export. A skill
  installation does not grant account access.

## Claude Code and Codex

Copy the entire chosen skill folder to the appropriate discovery directory:

| Host | One project's skills | Personal skills |
|---|---|---|
| Claude Code | `.claude/skills/NAME/` | `~/.claude/skills/NAME/` |
| Codex | `.agents/skills/NAME/` | `~/.agents/skills/NAME/` |

For example, the installed entrypoint should be
`.agents/skills/decide/SKILL.md`, not `.agents/skills/skills/decide/SKILL.md`.
Keep LICENSE, references, scripts, and examples alongside it when present.
Do not overwrite an existing skill with the same name. Compare it first and
choose whether to keep the existing version or explicitly replace it.

Start a fresh session or use the host's supported refresh. Ask it to list
available skills and confirm the name and description. In Claude Code, invoke
`/decide`; in Codex, select the skill or use `$decide`. In either host, an explicit
request to use the named skill should identify the intended workflow.

Try the fictional example in that skill's README before connecting business
data. Confirm the source was loaded and review the actual answer. A folder
copy is not proof that a host discovered or followed the skill.

Sources: [Claude Code skills](https://code.claude.com/docs/en/skills) and
[OpenAI skill documentation](https://developers.openai.com/codex/skills).
For Windows, use your home/profile directory and the host's documented paths;
the `~` notation above means the home directory, not a literal folder name.

## Grok Bot

Grok Bot supports saved skills shared across a user's bots. Its documented
workflow accepts instructions for saving a process as a skill; this guide does
not assume arbitrary GitHub-folder import works in every account.

1. Read the chosen SKILL.md. If it references supporting files, include those
   too. A packaged standalone workflow prompt includes the Markdown references.
2. In the intended private bot conversation, supply the workflow and ask:
   "Save these instructions as a skill named decide. Preserve the approval
   boundaries. Do not execute the example or create a routine."
3. Check the saved skill under Connect apps, Your plugins, Manage plugins and
   skills. Read its contents back and confirm it appears in the `/` selector.
4. Run the fictional example in a separate request. Verify the actual output.

Saving affects the account's shared private skill library. Review an existing
same-name skill before replacing it. Each bot still needs appropriate source
access. For the two financial helpers, the full package also contains scripts;
running them requires a host that supports Node.js and local files. A text-only
saved skill cannot execute a script merely because it mentions its filename.

Source: [Grok Bot skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).
This collection creates no routines or scheduled jobs during installation.

## Other hosts with skill discovery

Copy one complete folder, preserving its name and contents, into the documented
location. Check current host settings, refresh discovery, and test the example.

| Host | Discovery location | Official guide |
|---|---|---|
| Grok Build | `.grok/skills/NAME/` or `~/.grok/skills/NAME/` | [Grok Build skills](https://docs.x.ai/build/features/skills-plugins-marketplaces) |
| Cursor | `.cursor/skills/NAME/` in the project | [Cursor skills](https://cursor.com/docs/skills) |
| Gemini CLI | `.gemini/skills/NAME/` or `~/.gemini/skills/NAME/` | [Gemini CLI skills](https://geminicli.com/docs/cli/skills/) |
| GitHub Copilot | `.github/skills/NAME/` in the project; host support varies by surface | [Copilot skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) |
| OpenClaw | `skills/NAME/` within the configured workspace | [OpenClaw skills](https://docs.openclaw.ai/tools/skills) |

Use the host's existing installer if preferred. This collection does not need
an unversioned package runner, a new plugin service, or a global configuration
change. The [compatibility matrix](compatibility.md) records what was tested.

## Other AI chat apps

In ChatGPT, Claude chat, Gemini chat, Grok chat, or another assistant that accepts
text, paste the selected workflow instructions and permitted input material.
Include required references; generated `NAME-prompt.md` files combine them.
Ask the assistant to follow the workflow for this conversation. This is a
prompt fallback, not a claim of native installation or automatic invocation.

The host must actually have the necessary tools to access mail, watch video,
change tasks, or run calculators. Otherwise use supplied evidence and analysis
only. Do not call a transcript-only review a full video review or a drafted
reply a sent message. Respect context limits and report incomplete inputs.

## Optional local calculators

Only profit-plan and scale-plan include executable helpers. They require
Node.js 18 or newer, use built-in modules, and need no package installation.
From the downloaded collection root, try fictional data:

```sh
node skills/profit-plan/scripts/calculate.mjs skills/profit-plan/examples/fictional-input.json
node skills/scale-plan/scripts/calculate.mjs skills/scale-plan/examples/fictional-input.json
```

These commands print JSON and do not fetch or write data. Use the documented
input contracts for real analysis and keep actual inputs outside the collection.

## Updates and removal

Review changes before replacing a skill, preserve any private customizations
outside this public source, and test the same fictional example again. Remove
only the installed folder or the exact saved skill you selected. Do not delete
the host's entire skill directory or another user's copies.
