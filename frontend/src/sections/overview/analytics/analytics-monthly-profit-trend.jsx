'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Default placeholders (used only before data loads)
const SALES_DATA = Array(12).fill(0);
const EXPENSES_DATA = Array(12).fill(0);

const LEGENDS = [
  { name: 'Sales', color: '#00AB55' },
  { name: 'Expenses', color: '#FF4842' },
];

export function AnalyticsMonthlyProfitTrend() {
  const theme = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({ sales: SALES_DATA, expenses: EXPENSES_DATA, months: MONTHS, lastUpdated: null, source: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const cacheKey = `profit-trend:${year}`;
        let localSnapshot = null;
        try {
          const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
          if (cached) localSnapshot = cached;
          if (cached && !cancelled) setData(cached);
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
              // Use backend status endpoint for detection
              const r = await fetch(`${base}/api/status`, { signal: ac.signal });
              clearTimeout(t);
              if (r.ok) {
                try { sessionStorage.setItem('serverUrl:detected', base); } catch (_) {}
                return base;
              }
            } catch (_) {}
          }
          return CONFIG.site.serverUrl;
        }
        const base = await detectServerUrl();
        const res = await fetch(`${base}/api/analytics/profit?year=${year}`);
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load');
        if (!cancelled) {
          const payload = json.data || {};
          const hasAny = Array.isArray(payload?.sales) && payload.sales.some((v)=>Number(v)>0) || Array.isArray(payload?.expenses) && payload.expenses.some((v)=>Number(v)>0);
          if (hasAny) {
            setData(payload);
            try { localStorage.setItem(cacheKey, JSON.stringify(payload)); } catch (_) {}
            // sync to backend cache for persistence
            try {
              await fetch(`${base}/api/analytics/profit/cache`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
            } catch (_) {}
          } else if (localSnapshot) {
            // seed backend cache if API has no data but we have local snapshot
            setData(localSnapshot);
            try {
              await fetch(`${base}/api/analytics/profit/cache`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localSnapshot),
              });
            } catch (_) {}
          } else {
            // Try backend cache explicitly
            try {
              const r = await fetch(`${base}/api/analytics/profit/cache?year=${year}`);
              const j = await r.json();
              const cached = j?.data;
              if (r.ok && cached) {
                setData(cached);
                try { localStorage.setItem(cacheKey, JSON.stringify(cached)); } catch (_) {}
              } else {
                setData(payload);
              }
            } catch (_) {
              setData(payload);
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          // try local cache if available
          try {
            const cached = JSON.parse(localStorage.getItem(`profit-trend:${year}`) || 'null');
            if (cached) {
              setData(cached);
              setError('');
              return;
            }
          } catch (_) {}
          setError(e.message || 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [year]);

  const chartOptions = useChart({
    chart: {
      type: 'area',
      toolbar: { show: false },
    },
    colors: ['#00AB55', '#FF4842'],
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
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.3,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      strokeWidth: 0,
      hover: {
        size: 6,
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
      show: false,
    },
  });

  const series = [
    {
      name: 'Sales',
      data: (data?.sales || SALES_DATA).map((v) => Number(v) || 0),
    },
    {
      name: 'Expenses',
      data: (data?.expenses || EXPENSES_DATA).map((v) => Number(v) || 0),
    },
  ];

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Monthly Profit Trend
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Profit analysis over 6 months
            </Typography>
            {data?.lastUpdated ? (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Select size="small" value={year} onChange={(e) => setYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
          {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </Select>
      </Stack>

      {/* Legends positioned horizontally */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'flex-end' }}>
        {LEGENDS.map((legend) => (
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

      <Box sx={{ position: 'relative', minHeight: 280 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body2">{error}</Typography>
        ) : (
          <Chart type="area" series={series} options={chartOptions} height={280} />
        )}
      </Box>
    </Card>
  );
} 