'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

const KPI_DATA = [
  {
    title: 'Customer Satisfaction',
    value: '5',
    percentage: 95.2,
    icon: 'eva:star-fill',
  },
  {
    title: 'Order Fulfillment Rate',
    value: '99',
    percentage: 88.5,
    icon: 'eva:checkmark-circle-2-fill',
  },
  {
    title: 'Customer Retention Rate',
    value: '85',
    percentage: 95.8,
    icon: 'eva:people-fill',
  },
];

export function AnalyticsKpiCards() {
  const theme = useTheme();
  const settings = useSettingsContext();

  const getChartColors = () => {
    if (settings.primaryColor === 'default') {
      return [
        theme.palette.primary.dark,
        theme.palette.primary.main,
        theme.palette.primary.light,
        theme.palette.primary.lighter,
      ];
    }
    
    const colorMap = {
      cyan: theme.palette.cyan?.main || '#078DEE',
      purple: theme.palette.purple?.main || '#7635dc',
      blue: theme.palette.blue?.main || '#0C68E9',
      orange: theme.palette.orange?.main || '#fda92d',
      red: theme.palette.red?.main || '#FF3030',
      pink: theme.palette.pink?.main || '#E91E63',
      green: theme.palette.green?.main || '#00A76F',
    };
    
    return [colorMap[settings.primaryColor]];
  };

  const chartColors = getChartColors();
  const progressColor = chartColors[0];

  return (
    <Stack spacing={2}>
      {KPI_DATA.map((kpi, index) => (
        <Card
          key={index}
          sx={{
            p: 3,
            bgcolor: '#1E293B', // Dark blue background
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Icon */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.1,
              transform: 'rotate(15deg)',
            }}
          >
            <Iconify icon={kpi.icon} width={120} height={120} />
          </Box>

          <Stack direction="row" alignItems="center" spacing={3}>
            {/* Circular Progress */}
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `conic-gradient(${progressColor} ${kpi.percentage * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ color: progressColor, fontWeight: 700 }}>
                    {kpi.percentage}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                {kpi.value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {kpi.title}
              </Typography>
            </Box>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
} 