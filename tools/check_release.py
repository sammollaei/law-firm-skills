#!/usr/bin/env python3
"""Read-only structural checks for the explicit public release file set.

Uses Python's standard library. This is not a behavioral or legal review.
The metadata check intentionally covers this collection's conservative scalar
schema; a host's real YAML loader remains a separate compatibility check.
"""
from pathlib import Path
import json
import re
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILLS = (
    "morning", "watch", "build", "next", "link-review", "meeting", "friday",
    "todoist", "blind-spot", "decide", "evaluate-team", "email", "profit-plan",
    "follow-up", "scale-plan", "playbook", "setup",
)
VERSION = "0.2.1"
ROOT_FILES = {"README.md", "LICENSE", "THIRD_PARTY_NOTICES.md", "CONTRIBUTING.md", ".gitignore",
              "plugin.json", "skills.sh.json", ".claude-plugin/plugin.json",
              ".claude-plugin/marketplace.json", ".agents/plugins/marketplace.json", "assets/icon.svg", "assets/icon.png"}
DOCS = {"installation.md", "configuration.md", "compatibility.md", "validation.md",
        "index.html", "styles.css", "privacy.html", "terms.html", "support.html", ".nojekyll",
        "launch-kit.md"}
TOOLS = {"check_release.py", "build_release.py", "test_release.py"}
EVAL_CASES = tuple(f"{skill}-{kind}-{letter}" for skill in
                   ("morning", "meeting", "follow-up", "playbook", "decide")
                   for kind in ("direct", "indirect", "negative") for letter in ("a", "b")) + ("setup-first-run",)
EXTRAS = {
    "watch": {"THIRD_PARTY_NOTICES.md", "UPSTREAM_LICENSE"},
    "evaluate-team": {"references/role-worksheet.md"},
    **{name: {"scripts/calculate.mjs", "scripts/calculate.test.mjs",
               "references/calculations.md", "examples/fictional-input.json"}
       for name in ("profit-plan", "scale-plan")},
}


def expected_files():
    result = set(ROOT_FILES)
    result.update("docs/" + name for name in DOCS)
    result.update("tools/" + name for name in TOOLS)
    for name in EVAL_CASES:
        result.update(f"evals/{name}/{leaf}" for leaf in ("prompt.md", "graders/criteria.md"))
    for name in SKILLS:
        result.update("skills/" + name + "/" + leaf for leaf in
                      {"SKILL.md", "README.md", "LICENSE", "agents/openai.yaml"} | EXTRAS.get(name, set()))
    return result


def metadata(text):
    """Parse our narrow frontmatter without executing YAML tags or expansions."""
    match = re.match(r"\A---\n(.*?)\n---\n", text, re.S)
    if not match:
        raise ValueError("missing frontmatter")
    fields = {}
    for line in match.group(1).splitlines():
        if line.startswith("  "):
            if not re.fullmatch(r'  (author|version): [^\n]+', line):
                raise ValueError("unsupported metadata shape")
            continue
        key, sep, value = line.partition(": ")
        if line == "metadata:":
            continue
        if not sep or key not in {"name", "description", "license"} or key in fields:
            raise ValueError("unexpected or duplicate frontmatter field")
        fields[key] = value
    if set(fields) != {"name", "description", "license"}:
        raise ValueError("missing required collection metadata")
    return fields


def check(root=ROOT):
    root = Path(root).resolve()
    errors = []
    expected = expected_files()
    actual = set()
    for path in root.rglob("*"):
        rel = path.relative_to(root)
        if any(p in {".git", "__pycache__"} for p in rel.parts):
            continue
        if path.is_symlink():
            errors.append(f"symlink excluded: {rel}")
        elif path.is_file():
            actual.add(rel.as_posix())
    for item in sorted(actual - expected):
        errors.append(f"unexpected file (not read or packaged): {item}")
    for item in sorted(expected - actual):
        errors.append(f"missing file: {item}")
    # Unknown files are not read. In particular, never inspect a stray env or auth file.
    for item in sorted(expected & actual):
        path = root / item
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            continue
        if item == "assets/icon.png":
            body = path.read_bytes()
            if (body[:8] != b"\x89PNG\r\n\x1a\n" or len(body) < 33
                    or struct.unpack(">II", body[16:24]) != (512, 512)):
                errors.append("invalid 512px PNG icon")
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeError, OSError):
            errors.append(f"unreadable text: {item}")
            continue
        if not text.isascii():
            errors.append(f"non-ASCII text: {item}")
        if path.suffix == ".json":
            try:
                json.loads(text)
            except ValueError:
                errors.append(f"invalid JSON: {item}")
        if item.endswith("agents/openai.yaml"):
            try:
                lines = text.splitlines()
                if lines[0] != "interface:" or len(lines) != 4:
                    raise ValueError("unexpected UI metadata shape")
                ui = {line.strip().split(": ", 1)[0]: json.loads(line.split(": ", 1)[1]) for line in lines[1:]}
                if set(ui) != {"display_name", "short_description", "default_prompt"}:
                    raise ValueError("unexpected UI keys")
                if not 25 <= len(ui["short_description"]) <= 64:
                    raise ValueError("short description must be 25-64 characters")
                if "$" + path.parents[1].name not in ui["default_prompt"]:
                    raise ValueError("default prompt must name this skill")
            except (ValueError, IndexError, TypeError) as exc:
                errors.append(f"invalid UI metadata: {item}: {exc}")
        if path.name == "SKILL.md":
            try:
                fm = metadata(text)
                if fm["name"] != path.parent.name or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", fm["name"]):
                    errors.append(f"invalid name: {item}")
                if not 1 <= len(fm["description"]) <= 1024 or fm["license"] != "MIT":
                    errors.append(f"invalid description/license: {item}")
                if len(text.splitlines()) > 500:
                    errors.append(f"oversized entrypoint: {item}")
                if f'  version: "{VERSION}"' not in text:
                    errors.append(f"inconsistent skill version: {item}")
            except ValueError as exc:
                errors.append(f"metadata error: {item}: {exc}")
        if path.suffix == ".md":
            for target in re.findall(r"\]\(([^)]+)\)", text):
                if target.startswith(("https://", "http://", "#")):
                    continue
                target_path = target.split("#", 1)[0]
                resolved = (path.parent / target_path).resolve()
                if not resolved.is_relative_to(root) or not resolved.is_file():
                    errors.append(f"broken or escaping local link: {item}")
                if item.startswith("skills/") and not resolved.is_relative_to(path.parents[len(Path(item).parts) - 3]):
                    errors.append(f"skill depends on another folder: {item}")
    if not errors:
        plugin = json.loads((root / "plugin.json").read_text())
        claude = json.loads((root / ".claude-plugin/plugin.json").read_text())
        marketplace = json.loads((root / ".claude-plugin/marketplace.json").read_text())
        interface = plugin["extensions"]["com.openai"]["interface"]
        if any(p["version"] != VERSION or p["name"] != "law-firm-skills" for p in (plugin, claude)):
            errors.append("plugin version or name mismatch")
        if marketplace["plugins"][0]["source"] != "./":
            errors.append("marketplace source must be this repository")
        for field in ("documentationUrl", "supportUrl", "privacyPolicyUrl", "termsOfServiceUrl"):
            if not isinstance(claude.get(field), str) or not claude[field].startswith("https://"):
                errors.append(f"missing or invalid Claude directory link: {field}")
        if claude.get("icon", "").removeprefix("./") not in expected:
            errors.append("Claude directory icon must reference a packaged file")
        if len(interface["displayName"]) > 30 or len(interface["shortDescription"]) > 30:
            errors.append("plugin display name or subtitle exceeds directory limit")
        prompts = interface["defaultPrompt"]
        if len(prompts) > 3 or any(len(p) > 128 for p in prompts):
            errors.append("invalid directory starter prompts")
        for value in (interface["composerIcon"], interface["logo"], plugin["extensions"]["com.openai"]["onboardingSkill"]):
            if value.removeprefix("./") not in expected:
                errors.append("plugin references an unpackaged file")
        groupings = json.loads((root / "skills.sh.json").read_text())["groupings"]
        grouped = [skill for group in groupings for skill in group["skills"]]
        if len(grouped) != len(SKILLS) or set(grouped) != set(SKILLS):
            errors.append("directory groups must cover every skill once")
    return errors


if __name__ == "__main__":
    issues = check()
    if issues:
        print("\n".join(issues), file=sys.stderr)
        raise SystemExit(1)
    print(f"PASS: {len(SKILLS)} standalone skills; {len(expected_files())} allowlisted files; metadata, local links, and licenses checked.")
