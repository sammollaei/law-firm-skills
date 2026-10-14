# Installation

Choose one workflow first. Download the collection source or use the local
review folder. Inspect the chosen `skills/NAME/` directory before installing.
Do not copy any personal working data into it.

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
