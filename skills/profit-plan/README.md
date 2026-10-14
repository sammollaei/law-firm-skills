# profit-plan: Separate profit, cash, and cohort contribution

Read the [skill instructions](SKILL.md).

## What you need

Authorized financial evidence or hypothetical inputs. Optional calculator: Node.js 18+, no packages, USD cents only.

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

> Use profit-plan on the bundled fictional input. Explain the monthly profit, cohort contribution, and limits before recommending an operational change. Do not treat these figures as my firm's results.

## What a good result includes

The documented fictional arithmetic is $160,000 monthly profit, a $40,000 goal gap, and $7,000 cohort contribution before allocated overhead. These are different views, not interchangeable measures.

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

