"""Regression checks for rights notices across languages and generated pages."""
import json
import re
import unittest
from pathlib import Path
from publish_timetable import public_page

ROOT = Path(__file__).resolve().parents[1]


class CopyrightTests(unittest.TestCase):
    def test_public_inner_pages_use_approved_language(self):
        notices = json.loads((ROOT / 'assets/site-copyright.json').read_text())
        for page in ROOT.rglob('*.html'):
            if '.git' in page.parts or page.name in ('index.html', '404.html'):
                continue
            with self.subTest(page=page.relative_to(ROOT)):
                content = page.read_text()
                language = re.search(r'<html[^>]*lang="([^"]+)"', content)[1]
                self.assertEqual(content.count('class="site-copyright"'), 1)
                self.assertIn(notices[language], content)
                self.assertIn('/assets/site-copyright.css', content)

    def test_timetable_regeneration_preserves_notice_and_sources(self):
        data = json.loads((ROOT / 'train-watch/schedule-days.json').read_text())
        content = public_page(data)
        notice = json.loads((ROOT / 'assets/site-copyright.json').read_text())['zh-Hant']
        self.assertIn(notice, content)
        self.assertEqual(content.count('class="site-copyright"'), 1)
        self.assertIn('/assets/site-copyright.css', content)
        self.assertIn('資料來源：', content)
        self.assertIn('https://ods.railway.gov.tw/', content)


if __name__ == '__main__':
    unittest.main()
