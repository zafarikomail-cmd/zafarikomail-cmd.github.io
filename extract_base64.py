from pathlib import Path
import re

html_path = Path('index.html')
text = html_path.read_text(encoding='utf-8')

pattern = re.compile(r'(data:(?:image/[^;"\']+|application/pdf);base64,[A-Za-z0-9+/=\n\r]+)')

assets = []
for i, match in enumerate(pattern.finditer(text), start=1):
    full = match.group(1)
    prefix, data = full.split(',', 1)
    assets.append((i, prefix, data))

out_js = []
for i, prefix, data in assets:
    ext = 'pdf' if prefix.startswith('data:application/pdf') else 'jpg'
    name = f'asset{i}'
    out_js.append(f"export const {name} = '{prefix},{data}';")

Path('base64-data.js').write_text('\n'.join(out_js) + '\n', encoding='utf-8')
print(f'Wrote base64-data.js with {len(assets)} assets.')

# Replace first occurrences in HTML with placeholders
new_text = text
for i, prefix, data in assets:
    full = f'{prefix},{data}'
    if i == 1:
        repl = 'href="'+f'/{Path("base64-data.js").name}""'
    new_text = new_text.replace(full, f'__BASE64_ASSET_{i}__', 1)

# Actually we won't replace by direct URL because HTML needs JS to set values.
# We output placeholders and let manual or another script handle injection.
Path('index.html.placeholder').write_text(new_text, encoding='utf-8')
print('Created index.html.placeholder with placeholders.')
