#!/usr/bin/env python3
"""Generate SQL to move RU guide texts from guide_ru.json into guide_places.
Output: scripts/backfill_guide_ru.sql  (run once in Supabase SQL Editor).
Idempotent: ALTER … IF NOT EXISTS + UPDATE by slug (re-runnable)."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(HERE, '..', 'src', 'data', 'guide_ru.json'), encoding='utf-8'))

def q(s):
    """Standard SQL string literal: wrap in single quotes, double any apostrophe inside."""
    return "'" + (s or '').replace("'", "''") + "'"

lines = [
    '-- Backfill RU guide texts from guide_ru.json into guide_places.',
    '-- Single source of truth for the future content editor. Re-runnable.',
    'ALTER TABLE public.guide_places ADD COLUMN IF NOT EXISTS summary_ru text;',
    'ALTER TABLE public.guide_places ADD COLUMN IF NOT EXISTS body_ru text;',
    '',
]
n = 0
for slug, v in data.items():
    s = v.get('summary_ru') or ''
    b = v.get('body_ru') or ''
    lines.append(
        f"UPDATE public.guide_places SET "
        f"summary_ru = {q(s)}, body_ru = {q(b)} "
        f"WHERE slug = {q(slug)};"
    )
    n += 1

out = os.path.join(HERE, 'backfill_guide_ru.sql')
open(out, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(f'wrote {out} — {n} places')
