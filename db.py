import os
import requests

URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


def _headers():
    h = {"apikey": KEY, "Content-Type": "application/json"}
    if not KEY.startswith("sb_"):
        h["Authorization"] = "Bearer " + KEY
    return h


def upsert(table, rows, conflict):
    if not rows:
        return 0
    h = _headers()
    h["Prefer"] = "resolution=merge-duplicates,return=minimal"
    n = 0
    for i in range(0, len(rows), 500):
        chunk = rows[i:i + 500]
        u = URL + "/rest/v1/" + table + "?on_conflict=" + conflict
        r = requests.post(u, headers=h, json=chunk, timeout=60)
        if r.status_code >= 300:
            raise RuntimeError(table + " upsert failed: " + r.text[:300])
        n += len(chunk)
    return n


def select(table, query):
    u = URL + "/rest/v1/" + table + "?" + query
    r = requests.get(u, headers=_headers(), timeout=60)
    r.raise_for_status()
    return r.json()
