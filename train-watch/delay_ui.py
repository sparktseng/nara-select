"""Keep nearest-three delay cards and a five-column table after regeneration."""
import re

def remove_table_delay(page):
    page=page.replace('<th scope="col">誤點／預估</th>', '')
    page=re.sub(r'<td class="delay">.*?</td>', '', page, flags=re.S)
    page=page.replace(", '未取得',r.kind", ',r.kind').replace(",'未取得',r.kind", ',r.kind')
    page=page.replace("row.cells[4].className='delay';", '')
    # Keep special passage references with the station-role column.
    page=page.replace("row.cells[4].textContent=r.passTime?", "const pass=document.createElement('small');pass.textContent=r.passTime?")
    page=page.replace('row.cells[4].append(source);', '')
    page=page.replace('row.cells[5].replaceChildren(badge);', 'row.cells[5].replaceChildren(badge);row.cells[5].append(pass,source);',1)
    page=page.replace('row.cells[5]', 'row.cells[4]')
    return page.replace('min-width:620px', 'min-width:500px').replace('min-width:610px', 'min-width:500px')

def add_delay_ui(page):
    page, count=re.subn(r'function applyLive\(data\)\{.*?refreshLive\(\);setInterval\(refreshLive,60000\);', 'function refreshLive(){}', page, count=1, flags=re.S)
    if count != 1: raise ValueError('Legacy live block not found')
    return remove_table_delay(page).replace('</body>', '<script defer src="/assets/train-delay.js?v=20261009"></script></body>',1)
