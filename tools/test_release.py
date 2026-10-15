"""Regression checks for the release export boundary and reproducibility."""
import hashlib
import json
from pathlib import Path
import shutil
import tempfile
import unittest
import zipfile

import build_release
from check_release import ROOT, SKILLS, VERSION, check, expected_files


class ReleaseTests(unittest.TestCase):
    def test_unknown_file_is_rejected_without_reading(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp)
            for name in expected_files():
                dest = target / name
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / name, dest)
            # Invalid UTF-8 proves the unknown file does not enter text validation.
            (target / 'private-sentinel.bin').write_bytes(b'\xff\xfe')
            errors = check(target)
            self.assertEqual(errors, ['unexpected file (not read or packaged): private-sentinel.bin'])

    def test_reproducible_exports_and_complete_standalone_skills(self):
        with tempfile.TemporaryDirectory() as tmp:
            first, second = Path(tmp) / 'one', Path(tmp) / 'two'
            build_release.build(first)
            build_release.build(second)
            self.assertEqual({p.name: p.read_bytes() for p in first.iterdir()},
                             {p.name: p.read_bytes() for p in second.iterdir()})
            with zipfile.ZipFile(first / f'law-firm-skills-plugin-{VERSION}.zip') as archive:
                names = set(archive.namelist())
                self.assertIn('plugin.json', names)
                self.assertIn('skills/setup/SKILL.md', names)
                self.assertFalse(any(n.startswith(('docs/', 'evals/', 'tools/', 'law-firm-skills/')) for n in names))
                self.assertNotIn('.claude-plugin/marketplace.json', names)
                for name in names:
                    self.assertIn(name, expected_files())
                    self.assertEqual(archive.read(name), (ROOT / name).read_bytes())
            for skill in SKILLS:
                prefix = f'skills/{skill}/'
                required = {skill + '/' + name.removeprefix(prefix) for name in expected_files() if name.startswith(prefix)}
                with zipfile.ZipFile(first / f'{skill}.zip') as archive:
                    self.assertEqual(set(archive.namelist()), required)
            manifest = json.loads((first / 'manifest.json').read_text())
            for name, digest in manifest['artifacts'].items():
                self.assertEqual(hashlib.sha256((first / name).read_bytes()).hexdigest(), digest)

    def test_output_inside_source_or_existing_directory_is_refused(self):
        with self.assertRaises(ValueError):
            build_release.build(ROOT / 'dist')
        with tempfile.TemporaryDirectory() as tmp, self.assertRaises(ValueError):
            build_release.build(tmp)


if __name__ == '__main__':
    unittest.main()
