#!/usr/bin/env python
"""
Simple Prophet-based monthly sales forecast.
Input: single CLI arg: JSON with keys { history: [{month: 'YYYY-MM', grossSales: number, ...}], limit: int }
Output: JSON { forecast: [{ month: 'YYYY-MM', grossSales: float, type: 'forecast' }], meta: { model: 'prophet', generated_at, periods, history_len } }
If Prophet not installed or fails, returns empty forecast gracefully.
"""
import sys, json, datetime
from math import isnan

try:
    from prophet import Prophet  # prophet (new name) package
except Exception:
    try:
        from fbprophet import Prophet  # fallback older package
    except Exception:
        Prophet = None


def emit(payload):
    print(json.dumps(payload))


def main():
    if len(sys.argv) < 2:
        emit({"forecast": [], "meta": {"error": "no_input"}})
        return
    try:
        arg = json.loads(sys.argv[1])
    except Exception as e:
        emit({"forecast": [], "meta": {"error": "json_parse", "detail": str(e)}})
        return

    history = arg.get("history", [])
    limit = int(arg.get("limit", 6) or 6)

    # Build DataFrame for Prophet: ds (date), y (value)
    try:
        import pandas as pd
    except Exception as e:
        emit({"forecast": [], "meta": {"error": "pandas_missing", "detail": str(e)}})
        return

    if not history:
        emit({"forecast": [], "meta": {"empty": True}})
        return

    # Use first day of month for ds
    rows = []
    for h in history:
        m = h.get("month")
        val = float(h.get("grossSales") or 0)
        try:
            dt = datetime.datetime.strptime(m + '-01', '%Y-%m-%d')
        except Exception:
            continue
        rows.append({"ds": dt, "y": val})

    if len(rows) < 2 or Prophet is None:
        emit({"forecast": [], "meta": {"skipped": True, "reason": "insufficient_data_or_no_prophet", "history_len": len(rows)}})
        return

    df = pd.DataFrame(rows)

    # Basic model; yearly seasonality helps monthly data
    try:
        model = Prophet(growth='linear', yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
        model.fit(df)
        future = model.make_future_dataframe(periods=limit, freq='MS')
        fc = model.predict(future)
        # Take only the future tail rows (excluding the original history length)
        fc_tail = fc.tail(limit)
        out_rows = []
        for _, r in fc_tail.iterrows():
            ds = r['ds']
            yhat = float(r['yhat'])
            if isnan(yhat):
                continue
            out_rows.append({"month": ds.strftime('%Y-%m'), "grossSales": round(yhat, 2), "type": "forecast"})
        emit({"forecast": out_rows, "meta": {"model": "prophet", "generated_at": datetime.datetime.utcnow().isoformat(), "periods": limit, "history_len": len(rows)}})
    except Exception as e:
        emit({"forecast": [], "meta": {"error": "prophet_failure", "detail": str(e), "history_len": len(rows)}})

if __name__ == '__main__':
    main()
