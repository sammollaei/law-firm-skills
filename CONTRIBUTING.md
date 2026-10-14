# Contributing

Keep changes focused on a demonstrated workflow improvement or a supported
platform requirement. Preserve the short skill names and standalone folders.

- Use fictional examples. Do not submit client, employee, financial, account,
  authentication, or internal firm records, even if a test would be easier.
- Keep required references within the skill folder so one skill can be installed
  independently. Preserve license and upstream notices.
- State required capabilities and missing-access behavior. Do not add implicit
  sending, spending, new integrations, or recurring jobs.
- Explain a behavioral change with an example and expected outcome. Add tests
  for real arithmetic, data-integrity, or packaging risks rather than wording.
- Validate with the commands in [validation](docs/validation.md). Do not claim
  a platform was tested unless an actual run and observed result support it.

Submit a focused change with the problem, resulting behavior, and checks run.
Report suspected private-data exposure to the repository owner privately through
an available private channel; do not reproduce the sensitive value in an issue.
