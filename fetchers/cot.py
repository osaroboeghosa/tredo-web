import requests
import config


def _pct(window, cur):
    below = sum(1 for v in window if v < cur)
    same = sum(1 for v in window if v == cur)
    return round(100.0 * (below + 0.5 * same) / len(window), 1)


def fetch_cot(weeks=60):
    out = []
    for cur, code in config.COT_CODES.items():
        params = {
            "cftc_contract_market_code": code,
            "$order": "report_date_as_yyyy_mm_dd DESC",
            "$limit": str(weeks),
        }
        r = requests.get(config.COT_URL, params=params, timeout=60)
        r.raise_for_status()
        rows = []
        for d in r.json():
            lo = int(float(d["noncomm_positions_long_all"]))
            sh = int(float(d["noncomm_positions_short_all"]))
            rows.append({
                "currency": cur,
                "report_date": d["report_date_as_yyyy_mm_dd"][:10],
                "longs": lo,
                "shorts": sh,
                "net": lo - sh,
                "weekly_change": None,
                "pct52": None,
            })
        rows.sort(key=lambda x: x["report_date"])
        for i, row in enumerate(rows):
            if i > 0:
                row["weekly_change"] = row["net"] - rows[i - 1]["net"]
            if i >= 51:
                w = [x["net"] for x in rows[i - 51:i + 1]]
                row["pct52"] = _pct(w, row["net"])
        out.extend(rows)
    return out
