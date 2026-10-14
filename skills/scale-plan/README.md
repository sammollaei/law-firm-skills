# scale-plan: Test whether growth is feasible

Read the [skill instructions](SKILL.md).

## What you need

Goal, fee model, demand, shared capacity, cash timing, and owner limits. Optional calculator: Node.js 18+, no packages.

## Install or use

Copy this entire folder, including its license and resources, into your host's
documented skill directory. Check for an existing same-name skill first. Refresh
skill discovery and explicitly select this workflow. For a chat-only host, supply
the instructions and required references as context; that does not grant tools
or account access.

Start with the fictional example below. Connect real sources only through your
approved environment. The skill does not grant sending, spending, publishing,
legal, personnel, or account-change authority.

## Fictional example

> Use scale-plan with the bundled fictional scenario. It reaches the monthly profit target on paper. Check whether delivery capacity, owner workload, and cash also support it before recommending growth.

## What a good result includes

The sample has a 10-hour review-capacity shortfall, five owner hours over the limit, and a $5,000 month-end reserve funding lower bound. Hitting the profit arithmetic does not make it feasible.

This is an acceptance example, not a claim that every AI platform has been
live tested. Check the actual output and any missing-access disclosures.

Try the offline calculator from this folder:

```sh
node scripts/calculate.mjs examples/fictional-input.json
```

Read the [input contract](references/calculations.md) first. Real inputs belong
outside the installed skill folder. The bundled input is fictional.

## License

Copyright (c) 2026 Sam Mollaei. [MIT License](LICENSE).

