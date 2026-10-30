"""Local Chromium integration checks. Requires Python Playwright and Chromium.
Missing repository icons can be substituted ONLY in this test server with --fixture-icons.
No product files, browser profiles or live user storage are changed.
"""
import argparse, base64, functools, http.server, json, pathlib, threading
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
args=argparse.ArgumentParser();args.add_argument('--fixture-icons',action='store_true');args=args.parse_args()
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
    def do_GET(self):
        if args.fixture_icons and self.path.split('?')[0].lstrip('/') in ['icon.svg','icon-192.png','icon-512.png']:
            self.send_response(200);self.send_header('Content-Type','image/png');self.end_headers()
            self.wfile.write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII='));return
        super().do_GET()
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':390,'height':844},timezone_id='Europe/London',accept_downloads=True)
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    url=f'http://127.0.0.1:{server.server_port}/'
    page.goto(url);page.evaluate('navigator.serviceWorker.ready');page.reload()
    assert page.evaluate('!!navigator.serviceWorker.controller')
    page.get_by_role('button',name='Next week',exact=True).click()
    assert page.get_by_role('button',name='Next week',exact=True).get_attribute('aria-pressed')=='true'
    selected=page.evaluate('selectedWeek()')
    page.locator('[data-tab5="shop"]').click();assert page.evaluate('selectedWeek()')==selected
    assert page.get_by_role('button',name='Next week',exact=True).get_attribute('aria-pressed')=='true'
    assert 'Dried mango' in page.locator('#app').inner_text()
    page.locator('[data-tab5="prep"]').click();page.get_by_role('button',name='Thursday',exact=True).click()
    assert '480 g' in page.locator('#app').inner_text()
    page.evaluate("V.weights['2026-10-05']=81.4;V.weightKey='2026-10-05';put()")
    page.locator('[data-tab5="weight"]').click();assert page.evaluate('V.weightKey===current()')
    page.get_by_role('button',name='Previous week',exact=True).click();assert page.evaluate('V.weightKey!==current()')
    page.locator('#todayweight').fill('82.1');page.locator('#saveweight').click()
    assert page.evaluate('V.weights[now()]')==82.1
    assert page.evaluate("V.weights['2026-10-05']")==81.4
    page.locator('[data-tab5="plan"]').click();page.locator('[data-tab5="weight"]').click()
    assert page.evaluate('V.weightKey===current()')
    page.evaluate("V.weightKey='2026-10-05';put()");page.reload();assert page.evaluate('V.weightKey===current()')
    page.evaluate("V.weightKey='2026-10-05';draw5()")
    page.once('dialog',lambda dialog:dialog.accept('81.6'));page.locator('[data-editweight="2026-10-05"]').click()
    assert page.evaluate("V.weights['2026-10-05']")==81.6
    # Recipe editor uses V6 draw and registers a product for new ingredients.
    page.locator('[data-tab5="recipes"]').click();page.locator('[data-re="noodles"]').click()
    page.locator('#rn').fill('My noodles');page.locator('#saverecipe').click()
    assert page.evaluate("r('noodles').name")=='My noodles'
    page.locator('[data-tab5="products"]').click();page.locator('#pickProduct').select_option('Chicken breast')
    page.locator('#pn_kcal').fill('107');page.locator('#verified').check();page.locator('#saveProduct').click()
    assert page.evaluate("productFor('Chicken breast').nut.kcal")==107
    # Backup exports round-trip all saved data; malformed imports do not replace it.
    page.locator('[data-tab5="more"]').click()
    with page.expect_download() as dl:page.locator('#export5').click()
    backup=json.loads(pathlib.Path(dl.value.path()).read_text());assert backup['v5']['weights']['2026-10-05']==81.6
    before=page.evaluate('JSON.stringify(V)')
    page.once('dialog',lambda d:d.accept());page.locator('#backupFile').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"format":"mealflow-v5-backup","v5":{"weights":[]},"legacy":{}}'})
    assert page.evaluate('JSON.stringify(V)')==before
    page.once('dialog',lambda d:d.accept());page.locator('#backupFile').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
    assert page.evaluate("V.weights['2026-10-05']")==81.6
    # Install cached app shell still works with all network traffic disabled.
    context.set_offline(True);page.reload();page.locator('[data-tab5="plan"]').click()
    assert 'Weekly meals' in page.locator('#app').inner_text()
    page.locator('[data-tab5="weight"]').click();assert page.evaluate("V.weights['2026-10-05']")==81.6
    assert not errors,errors
    browser.close()
server.shutdown()
print('PASS: mobile navigation, cooking, current/historical weights, recipe/product editing, backup round-trip, invalid-import protection, cached offline reload. Fixture icons:',args.fixture_icons)
