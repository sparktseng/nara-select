"""Keep the shared nearest-three delay UI installed when regenerating the page."""
import re

def add_delay_ui(page):
    page, count=re.subn(r'function applyLive\(data\)\{.*?refreshLive\(\);setInterval\(refreshLive,60000\);', 'function refreshLive(){}', page, count=1, flags=re.S)
    if count != 1: raise ValueError('Legacy live block not found')
    return page.replace('</body>', '<script defer src="/assets/train-delay.js?v=20261009"></script></body>',1)
