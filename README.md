# Law Firm Skills by Sam Mollaei

Practical AI workflows for lawyers and law firm owners.

Review the morning's priorities, turn meetings into completed work, evaluate
ideas, document handoffs, and plan the firm's growth. These 16 skills give an
AI assistant a repeatable method, clear approval boundaries, and a standard
for checking whether the work is actually done.

Created and adapted by [Sam Mollaei](https://github.com/sammollaei).
Free to use, modify, and share commercially under the [MIT License](LICENSE),
with [upstream attribution](THIRD_PARTY_NOTICES.md) preserved.

## Start here

Visit the [quick-start website](https://sammollaei.github.io/law-firm-skills/) for
a simple catalog, a fictional first example, and installation choices. The
collection includes 16 substantive workflows plus an optional setup skill.

## Install the Claude Code plugin

Run these inside Claude Code:

```text
/plugin marketplace add sammollaei/law-firm-skills
/plugin install law-firm-skills@sam-mollaei
```

Restart, then use `/law-firm-skills:setup` or `/law-firm-skills:morning`.
The namespace distinguishes the plugin from a personal skill with the same name.
These commands use this repository's marketplace; directory approval is separate.

The release also includes a root-manifest plugin ZIP for OpenAI's publisher flow.
ChatGPT and Claude directory listings are **not live yet**. Do not treat a ZIP
or a submitted review as a published listing. See [compatibility](docs/compatibility.md).

## Install individual skills in a project

With Node.js 22.20+ installed, open a terminal in the project where you use
Claude Code or Codex and run this tested, version-pinned installer:

```sh
npx --yes skills@1.7.2 add sammollaei/law-firm-skills --skill morning --agent claude-code codex --copy
```

Choose only the host you use if preferred. Restart that host in the same project,
then run `/morning` in Claude Code or `$morning` in Codex. For all workflows plus setup,
replace `morning` in the installer command with `'*'`. Review any overwrite
prompt if you already have a skill with the same name.

Start with the [fictional morning test](docs/installation.md#test-morning).
Your own approved connectors are needed for live inbox or business-system work.
For ZIP downloads, other platforms, and troubleshooting, see
[installation](docs/installation.md). [Test results](docs/compatibility.md)
separate successful installation from workflow quality and untested integrations.

## Try one

Start with [decide](skills/decide/README.md). It can work from a question and
supplied facts without connecting an inbox or business system:

> Use the decide skill. Our fictional two-lawyer firm can improve appointment
> reminders or replace its intake software this month. Missed appointments are
> the main measured problem; the current software already supports reminders.
> Compare the choices, recommend a first move, and say what would change it.

Choose a skill below, then follow [installation](docs/installation.md).
Every folder includes its instructions, a concrete example, requirements, and
license. Install only what you need. Short names can collide with existing
skills, so check before copying or replacing a folder.

## The collection

| Skill | What it helps you do |
|---|---|
| [morning](skills/morning/README.md) | Review inboxes, messages, tasks, and metrics; finish authorized work and surface owner decisions. |
| [watch](skills/watch/README.md) | Evaluate training videos and demos using transcripts and visual evidence. |
| [build](skills/build/README.md) | Turn an idea into an approved specification, then build and verify it. |
| [next](skills/next/README.md) | Choose the next worthwhile action, or decide to wait or stop. |
| [link-review](skills/link-review/README.md) | Decide which articles, tools, posts, and repositories deserve attention. |
| [meeting](skills/meeting/README.md) | Extract decisions and commitments, reconcile prior work, and execute approved actions. |
| [friday](skills/friday/README.md) | Turn saved resources into a weekly report of useful ideas. |
| [todoist](skills/todoist/README.md) | Work selected tasks, verify completion, and preserve deadlines and recurrence. |
| [blind-spot](skills/blind-spot/README.md) | Find the constraint or assumption preventing progress toward a goal. |
| [decide](skills/decide/README.md) | Compare options fairly and explain the evidence behind a recommendation. |
| [evaluate-team](skills/evaluate-team/README.md) | Assess role outcomes with comparable evidence and visible data gaps. |
| [email](skills/email/README.md) | Do the authorized work behind an email and prepare a verified response. |
| [profit-plan](skills/profit-plan/README.md) | Separate accounting profit, collected fees, and matter-cohort economics. |
| [follow-up](skills/follow-up/README.md) | Check agreed work and prepare the specific follow-up still needed. |
| [scale-plan](skills/scale-plan/README.md) | Model growth against delivery capacity, cash timing, and owner workload. |
| [playbook](skills/playbook/README.md) | Turn an established process into an SOP with clear exceptions and proof of completion. |

## Choose your platform

The source uses the portable [Agent Skills format](https://agentskills.io/specification).
Setup guides cover Claude Code, Codex, Grok Bot, Grok Build, Cursor, Gemini CLI,
GitHub Copilot, and OpenClaw. Other chat assistants can use the instructions
with supplied inputs. See the [compatibility matrix](docs/compatibility.md) for
the difference between documented setup, local packaging checks, and live testing.

Skills do not create connectors or grant account access. Work involving mail,
tasks, calendars, financial records, or video depends on the host's approved
tools and the access you choose. Without them, the assistant can review supplied
material and must disclose what it could not verify. The watch skill includes
a portable review workflow; a video download/transcription runtime is not bundled.

Only profit-plan and scale-plan include executable helpers. They use Node.js
built-ins, read a supplied JSON file, print calculations, and make no network
calls or writes. Their examples are fictional, not business benchmarks.

## Make it yours

Keep your firm's goals, systems, working hours, owners, and permission rules in
your own private context. The [configuration guide](docs/configuration.md)
shows the minimum useful information. No actual client, employee, financial,
or internal firm records are included in this collection.

These workflows focus on practice operations and management. They do not
establish current law, calculate legal deadlines, or replace required legal,
financial, or personnel review. Installing a skill does not authorize sending,
spending, filing, hiring, or changing a business system.

## Share a skill

Share the collection's repository page for the full catalog or a skill's folder
page for one workflow. Keep the entire skill folder together when copying it,
including its license and any references. This makes it possible to use one
skill without installing the other 15.

For maintainers: [validation and packaging](docs/validation.md),
[contributing](CONTRIBUTING.md), and [license notices](THIRD_PARTY_NOTICES.md).
