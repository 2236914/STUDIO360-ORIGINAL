import sys
import json
from datetime import datetime

try:
    # Prophet renamed to prophet (cmdstan) or fbprophet (legacy)
    try:
        from prophet import Prophet
    except Exception:
        from fbprophet import Prophet  # type: ignore
except Exception as e:
    print(json.dumps({"error": f"Prophet not installed: {e}"}))
    sys.exit(0)

def main():
    raw = sys.stdin.read()
    payload = json.loads(raw or '{}')
    # Expect payload: { "series": [v1..v12], "year": 2025 }
    series = payload.get('series') or []
    year = int(payload.get('year') or datetime.utcnow().year)

    # Build monthly dataframe for Prophet (requires ds, y)
    ds = []
    y = []
    for m, v in enumerate(series, start=1):
        ds.append(f"{year}-{m:02d}-01")
        y.append(float(v or 0))

    import pandas as pd
    df = pd.DataFrame({"ds": pd.to_datetime(ds), "y": y})
    m = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
    m.fit(df)
    # Forecast next 6 months
    future = m.make_future_dataframe(periods=6, freq='MS')
    fcst = m.predict(future)
    # Take last 6 months forecast values (yhat)
    tail = fcst.tail(6)
    out = {
        "forecast": [float(v) for v in tail['yhat'].tolist()],
        "dates": [d.strftime('%Y-%m-%d') for d in tail['ds'].dt.to_pydatetime()],
    }
    print(json.dumps(out))

if __name__ == '__main__':
    main()
