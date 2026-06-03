from pathlib import Path
import re

# Bug 6 fix: resolve index.html relative to this script's directory,
# so the script works regardless of the current working directory.
script_dir = Path(__file__).parent
html_path = script_dir / 'index.html'
text = html_path.read_text(encoding='utf-8')

# Bug 1 fix: strip \n and \r from the character class – they are not valid
# base64 characters and cause literal newlines to be embedded in the JS output,
# breaking JS syntax.  Base64 data in HTML attributes is always on one line.
pattern = re.compile(r'(data:(?:image/[^;"\']+|application/pdf);base64,[A-Za-z0-9+/=]+)')

assets = []
for i, match in enumerate(pattern.finditer(text), start=1):
    full = match.group(1)
    prefix, data = full.split(',', 1)
    assets.append((i, prefix, data))

out_js = []
for i, prefix, data in assets:
    # Bug 5 fix: derive the correct extension from the MIME type instead of
    # always defaulting to 'jpg'.  (ext was computed but never used before –
    # now it is used to build a descriptive variable name.)
    mime = prefix.split(':')[1].split(';')[0]          # e.g. "image/jpeg"
    ext = mime.split('/')[-1]                           # e.g. "jpeg"
    name = f'asset{i}_{ext}'                            # e.g. "asset1_jpeg"

    # Bug 2 fix: use a backtick template literal so the value is never broken
    # by single-quote characters that could appear in the (rare) edge-case of
    # a malformed data URI.  Backticks are safe here because base64 data
    # never contains backticks.
    out_js.append(f'export const {name} = `{prefix},{data}`;')

Path('base64-data.js').write_text('\n'.join(out_js) + '\n', encoding='utf-8')
print(f'Wrote base64-data.js with {len(assets)} assets.')

# Replace first occurrences in HTML with placeholders.
# Bug 3 & 4 fix: removed the dead `repl` variable (it was built but never used,
# and had an extra closing double-quote: href="...url"" ).
new_text = text
for i, prefix, data in assets:
    full = f'{prefix},{data}'
    new_text = new_text.replace(full, f'__BASE64_ASSET_{i}__', 1)

# We output placeholders and let manual or another script handle injection.
Path('index.html.placeholder').write_text(new_text, encoding='utf-8')
print('Created index.html.placeholder with placeholders.')
