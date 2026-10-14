# Configure your private context

Start with a fictional example. Then provide only the context needed for the
chosen task through your AI platform's approved private workspace or conversation.
Do not edit these public skill files to store live firm data.

Useful context includes:

| Context | What to establish |
|---|---|
| Scope | Firm or practice group, task, current priorities, and exclusions. |
| Time | Account timezone, working calendar, quiet hours, and observation window. |
| Sources | Which existing connectors, files, calendars, task lists, and systems are authorized. |
| Ownership | Verified responsible roles and the source of their authority. |
| Permissions | What the assistant may read, prepare, save, send, or change for this task. |
| Evidence | The artifact or downstream result that proves completion. |

Example private setup instruction, using fictional information:

> Work on the Example Firm training project in UTC. Use only the supplied
> fictional files. You may analyze and draft in this conversation. Ask before
> saving to a shared system, contacting anyone, changing dates, or spending.
> A completed task needs the requested output and a readback, not a promise.

Do not paste API keys, passwords, session cookies, bank details, or client
identifiers into configuration prompts. Connect services through the host's
supported account connection or credential mechanism. This collection contains
no authentication setup scripts and does not ask an agent to read secrets.

Examples of integration requirements:

- Morning: whichever inbox, messages, calendar, tasks, and metrics you select.
- Email: current mailbox thread access; draft/send capabilities only if authorized.
- Todoist: an authorized Todoist connector or authenticated interface.
- Meeting: an accessible recording/transcript and optional task-system access.
- Follow-up: current commitments, complete relevant replies, and deliverables.
- Evaluate-team: role expectations and authorized, comparable work/QA records.
- Profit-plan and scale-plan: reconciled records or explicitly hypothetical inputs.
- Watch: media tools, or a transcript plus timestamped visuals you may share.

No connection is required to try decide, build's planning stage, blind-spot,
next, or playbook using sufficient fictional inputs. Their conclusions remain
limited to those inputs. Link-review/friday need readable source material, which
can also be supplied instead of retrieved live.

Missing access must be reported, not treated as zero activity or successful
completion. An installed skill's instructions are guidance, not a technical
security boundary. Keep the host's permissions and any required human review
enabled. External documents cannot grant the assistant additional authority.
