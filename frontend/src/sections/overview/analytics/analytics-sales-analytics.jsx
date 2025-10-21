'use client';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
// removed forecast/gaps controls
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Legends will be computed from theme inside the component

export function AnalyticsSalesAnalytics() {
  const theme = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seriesState, setSeriesState] = useState({
    months: MONTHS,
    yoy: null,
    series: { '360': Array(12).fill(0), 'Shopee': Array(12).fill(0), 'TikTok Shop': Array(12).fill(0) },
    lastUpdated: null,
    yoySource: null,
  });
  // removed forecast/gaps state

  // fetch data
  useEffect(() => {
    let cancelled = false;
    let timer;
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        // Try local cache first for instant paint
        const cacheKey = `sales-analytics:${year}`;
        let localSnapshot = null;
        try {
          const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
          if (cached) localSnapshot = cached;
          if (cached && !cancelled) setSeriesState(cached);
        } catch (_) {}

        async function detectServerUrl() {
          try {
            const cached = sessionStorage.getItem('serverUrl:detected');
            if (cached) return cached;
          } catch (_) {}
          const candidates = [
            CONFIG.site.serverUrl,
            typeof window !== 'undefined' ? `${window.location.origin.replace(/:\d+$/, ':3001')}` : null,
            typeof window !== 'undefined' ? `${window.location.origin.replace(/:\d+$/, ':3021')}` : null,
            'http://localhost:3001',
            'http://localhost:3021',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3021',
          ].filter(Boolean);
          for (const base of candidates) {
            try {
              const ac = new AbortController();
              const t = setTimeout(() => ac.abort(), 2500);
              const r = await fetch(`${base}/api/health`, { signal: ac.signal });
              clearTimeout(t);
              if (r.ok) {
                try { sessionStorage.setItem('serverUrl:detected', base); } catch (_) {}
                return base;
              }
            } catch (_) {}
          }
          return CONFIG.site.serverUrl;
        }

        async function fetchWithFallback() {
          const base = await detectServerUrl();
          const primary = `${base}/api/analytics/sales?year=${year}`;
          const fallback = `/api/analytics/sales?year=${year}`;
          try {
            const res1 = await fetch(primary);
            const json1 = await res1.json();
            if (!res1.ok || !json1?.success) throw new Error(json1?.message || `HTTP ${res1.status}`);
            return json1;
          } catch (e1) {
            // try relative path
            const res2 = await fetch(fallback);
            const json2 = await res2.json();
            if (!res2.ok || !json2?.success) throw new Error(json2?.message || `HTTP ${res2.status}`);
            return json2;
          }
        }

        const json = await fetchWithFallback();
        if (!cancelled) {
          const base = await detectServerUrl();
          const data = json.data || {};
          const hasData = !!data.hasData;
          // If API has data, persist to local and backend cache
          if (hasData) {
            setSeriesState(data);
            try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (_) {}
            // Fire-and-forget sync to backend cache to survive restarts
            try {
              await fetch(`${base}/api/analytics/sales/cache`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
            } catch (_) {}
          } else if (localSnapshot && localSnapshot.hasData) {
            // If API has no data (e.g., no DB and no server cache yet), seed server cache from local snapshot
            setSeriesState(localSnapshot);
            try {
              await fetch(`${base}/api/analytics/sales/cache`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localSnapshot),
              });
            } catch (_) {}
          } else {
            // Try backend cache explicitly
            try {
              const r = await fetch(`${base}/api/analytics/sales/cache?year=${year}`);
              const j = await r.json();
              const cached = j?.data;
              if (r.ok && cached && cached.hasData) {
                setSeriesState(cached);
                try { localStorage.setItem(cacheKey, JSON.stringify(cached)); } catch (_) {}
              } else {
                setSeriesState(data);
              }
            } catch (_) {
              setSeriesState(data);
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          // Try to show cached data if available despite error
          try {
            const cached = JSON.parse(localStorage.getItem(`sales-analytics:${year}`) || 'null');
            if (cached) {
              setSeriesState(cached);
              setError('');
              return;
            }
          } catch (_) {}
          const msg = typeof e?.message === 'string' ? e.message : 'Failed to load analytics';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    // Refresh on tab focus and every 60s
    function onFocus() { fetchData(); }
    if (typeof window !== 'undefined') window.addEventListener('focus', onFocus);
    timer = setInterval(fetchData, 60000);
    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') window.removeEventListener('focus', onFocus);
      if (timer) clearInterval(timer);
    };
  }, [year]);

  // No global default caching — keep year-specific only to avoid cross-year leaks

  // Color mapping per requirement
  const COLORS = {
    primary360: theme.palette.primary?.main || '#2065D1',
    shopee: theme.palette.orange?.main || '#fda92d',
    tiktok: theme.palette.pink?.main || '#E91E63',
  };

  const chartOptions = useChart({
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
  // Series order: 360 (primary), Shopee (orange), TikTok (pink)
  colors: [COLORS.primary360, COLORS.shopee, COLORS.tiktok],
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    xaxis: {
      categories: MONTHS,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => fNumber(value),
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    markers: {
      size: 0, // Hide permanent dots
      strokeWidth: 0,
      hover: {
        size: 6, // Show dots only on hover
        strokeWidth: 2,
        strokeColors: theme.palette.background.paper,
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => fNumber(value),
        title: {
          formatter: () => '',
        },
      },
    },
    legend: {
      show: false, // Hide default legend
    },
  });
  const series = useMemo(() => ([
    { name: '360', data: (seriesState?.series?.['360'] || Array(12).fill(0)).map((v) => Number(v) || 0) },
    { name: 'Shopee', data: (seriesState?.series?.Shopee || Array(12).fill(0)).map((v) => Number(v) || 0) },
    { name: 'TikTok Shop', data: (seriesState?.series?.['TikTok Shop'] || Array(12).fill(0)).map((v) => Number(v) || 0) },
  ]), [seriesState]);

  const { yoyText, yoyColor, yoyIcon } = useMemo(() => {
    const themeText = theme.palette.text.secondary;
    if (typeof seriesState?.yoy === 'number') {
      const pct = seriesState.yoy * 100;
      const sign = pct >= 0 ? '+' : '';
      const color = pct > 0 ? 'success.main' : pct < 0 ? 'error.main' : themeText;
      const icon = pct > 0 ? 'eva:trending-up-fill' : pct < 0 ? 'eva:trending-down-fill' : null;
      return { yoyText: `(${sign}${pct.toFixed(0)}%) than last year`, yoyColor: color, yoyIcon: icon };
    }
    return { yoyText: '(n/a)', yoyColor: themeText, yoyIcon: null };
  }, [seriesState, theme.palette.text.secondary]);

  // removed forecast loader

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Sales Analytics
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: yoyColor }} title={seriesState?.yoySource ? `YoY source: ${seriesState.yoySource}` : ''}>
            {yoyIcon ? <Iconify icon={yoyIcon} width={16} /> : null}
            <Typography variant="body2" sx={{ color: yoyColor }}>{yoyText}</Typography>
            </Stack>
            {seriesState?.lastUpdated ? (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Last updated: {new Date(seriesState.lastUpdated).toLocaleString()}
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* removed gaps and forecast controls */}
          <Select
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ minWidth: 110 }}
          >
            {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      {/* Legends positioned inside the card */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'flex-end' }}>
        {[{ name: '360', color: COLORS.primary360 }, { name: 'Shopee', color: COLORS.shopee }, { name: 'TikTok Shop', color: COLORS.tiktok }].map((legend) => (
          <Stack key={legend.name} direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: legend.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {legend.name}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ position: 'relative', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : error ? (
          <Typography color="error" variant="body2">{error}</Typography>
        ) : seriesState?.hasData === false ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>No data for {year}</Typography>
        ) : (
          <Chart type="line" series={series} options={chartOptions} height={320} />
        )}
      </Box>
    </Card>
  );
} 