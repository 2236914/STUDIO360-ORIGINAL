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
        const cacheKey = `sales-analytics:${year}`;
        if (process.env.NEXT_PUBLIC_DASHBOARD_MOCK === 'true') {
          const mock = {
            months: MONTHS,
            series: {
              '360': [4000,5200,4800,5300,5600,5900,6200,6400,6800,7000,7400,7800],
              'Shopee': [2600,2800,3000,3200,3400,3600,3800,3900,4100,4300,4500,4700],
              'TikTok Shop': [1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,2300],
            },
            hasData: true,
            lastUpdated: new Date().toISOString(),
            yoy: 0.11,
            yoySource: 'mock',
          };
          setSeriesState(mock);
          try { localStorage.setItem(cacheKey, JSON.stringify(mock)); } catch (_) {}
          return;
        }
        // Real API
        const res = await fetch(`/api/analytics/sales?year=${year}`);
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
        if (!cancelled) {
          // Set the fetched data to state
          const data = json.data || json;
          if (data) {
            setSeriesState({
              months: data.months || MONTHS,
              series: data.series || {
                '360': Array(12).fill(0),
                'Shopee': Array(12).fill(0),
                'TikTok Shop': Array(12).fill(0),
              },
              yoy: data.yoy || null,
              yoySource: data.yoySource || null,
              lastUpdated: data.lastUpdated || new Date().toISOString(),
              hasData: data.hasData !== undefined ? data.hasData : true,
            });
            // Persist to local cache
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                months: data.months || MONTHS,
                series: data.series || {},
                yoy: data.yoy || null,
                yoySource: data.yoySource || null,
                lastUpdated: data.lastUpdated || new Date().toISOString(),
                hasData: data.hasData !== undefined ? data.hasData : true,
              }));
            } catch (_) {}
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