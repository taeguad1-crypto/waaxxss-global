from pathlib import Path

p=Path('tools/build_v21_safe.py')
s=p.read_text(encoding='utf-8')
old="m=re.search(r'const IMAGES=(\\{.*?\\});\\s*const LOGO=\"(data:image/png;base64,[^\"]+)\";',s,re.S)\nif not m:\n    raise SystemExit('ERROR: V20 IMAGES/LOGO block not found')\nimgs=json.loads(m.group(1))\nlogo=m.group(2)"
new="start=s.find('const IMAGES=')\nlogo_pos=s.find('const LOGO=', start)\nif start < 0 or logo_pos < 0:\n    raise SystemExit('ERROR: IMAGES or LOGO marker not found')\nobj_start=s.find('{', start)\nobj_end=s.rfind('};', start, logo_pos)\nif obj_start < 0 or obj_end < 0:\n    raise SystemExit('ERROR: IMAGES object boundary not found')\nimgs=json.loads(s[obj_start:obj_end+1])\nq1=s.find('\\\"', logo_pos)\nq2=s.find('\\\"', q1+1)\nif q1 < 0 or q2 < 0:\n    raise SystemExit('ERROR: LOGO value boundary not found')\nlogo=s[q1+1:q2]"
if old not in s:
    # fallback: replace the whole extraction section between m=re.search and def I
    a=s.find('m=re.search(')
    b=s.find('\ndef I(', a)
    if a < 0 or b < 0:
        raise SystemExit('ERROR: builder extraction section not found')
    s=s[:a]+new+'\n'+s[b:]
else:
    s=s.replace(old,new)
p.write_text(s,encoding='utf-8')
print('V21 BUILDER FIXED')
