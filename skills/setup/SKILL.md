---
name: setup
description: Help a lawyer, law firm owner, or practice manager get started with Law Firm Skills. Choose a first workflow, show a fictional result, and explain supplied-data and already-connected-tool modes. Use when installing this collection or asking how to start; not for unrelated software setup.
license: MIT
metadata:
  author: Sam Mollaei
  version: "0.2.1"
---

# Get started with Law Firm Skills

Help the user get one useful result with minimal setup. This collection contains
16 practice-management workflows plus this onboarding skill. Installation grants
no access to accounts, permission to act, or ongoing background work.

## First conversation

Use information already supplied. Ask only for missing information that changes
the first workflow: their role, the outcome they want, whether they will supply
notes or use tools already authorized in this workspace, and applicable approval
boundaries. Bundle these in one short question rather than a long questionnaire.
Do not ask for client names, credentials, financial records, or account access
to demonstrate the collection. If they want to try it immediately, use the
fictional example below without blocking on configuration.

Choose decide or playbook for the first result. Use morning once source coverage
is understood. Other entry points: meeting for notes to actions; follow-up for
existing commitments; build for an idea requiring a specification and approval.
Name the intended skill and load it using the host's skill selector when
available. If it is not installed or available, say so and provide the explicit
request the user can paste. Do not claim an unavailable skill was invoked.

## Fictional first result

Example: A two-lawyer firm can improve appointment reminders or replace intake
software this month. Missed appointments are the measured problem; the existing
software already supports reminders. No cost, volume, or conversion data was
provided. The user wants advice only.

Show a compact decision: test the existing reminder feature first; it addresses
the observed issue with fewer implementation assumptions. Ask the responsible
operator to confirm permission and baseline attendance before any pilot. Do
not invent savings, a deadline, or a completed configuration. Reconsider if
evidence shows the current software cannot deliver reliable reminders or the
main cause lies elsewhere. Label this as fictional, not a client result.

## Explain use and access

- Supplied-data mode: use permitted notes, exports, or a fictional example.
- Connected mode: use only tools actually available and authorized by the user.
  This collection bundles no inbox, CRM, calendar, task, or video connector.
- Claude Code standalone: /morning. Claude plugin: /law-firm-skills:morning.
- Codex: select the skill or use $morning. ChatGPT: select the installed plugin
  with the @ selector; a public directory listing is required for that route.
- A pasted workflow prompt is a fallback, not native installation.

If private workspace context is useful, propose a short record of role, goal,
source coverage, timezone, and approval rules. Save only in a user-approved
private location with permission, never inside the public plugin or repository.
Do not install tools, connect accounts, create automations, send messages, or
modify business records during setup. End with one suggested first request.
