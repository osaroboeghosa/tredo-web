import os
import sys
from datetime import date, datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
from fetchers import cot

MODE = sys.argv[1] if len(sys.argv) > 1 else "dry"


def age(day):
    return (date.today() - datetime.strptime(day, "%Y-%m-%d").date()).days


def test_cot():
    rows = cot.fetch_cot()
    latest = {}
    for r in rows:
        latest[r["currency"]] = r
    for cur in ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF"]:
        r = latest.get(cur)
        if r is None:
            print("FAIL COT", cur, "no data")
            continue
        a = age(r["report_date"])
        flag = "OK" if a <= 10 else "STALE"
        print(flag, "COT", cur, r["report_date"], "net", r["net"], "pct52", r["pct52"], "age", a)
    if MODE == "write":
        n = db.upsert("cot", rows, "currency,report_date")
        print("wrote", n, "cot rows")


print("source test, mode:", MODE)
for name, fn in [("COT", test_cot)]:
    try:
        fn()
    except Exception as e:
        print("FAIL", name, str(e)[:300])
print("done")
