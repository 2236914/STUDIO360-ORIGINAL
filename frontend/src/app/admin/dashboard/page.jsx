'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const CHART_DATA = [
  {
    name: 'Total Sellers',
    data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
  },
  {
    name: 'Active Sellers',
    data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
  },
  {
    name: 'New Registrations',
    data: [35, 41, 62, 42, 13, 18, 29, 37, 36],
  },
];

// ----------------------------------------------------------------------

export default function AdminDashboardPage() {
  const [chartData, setChartData] = useState('Total Sellers');

  const handleChangeChartData = (event) => {
    setChartData(event.target.value);
  };

  const chartOptions = useChart({
    stroke: {
      show: false,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
    tooltip: {
      y: {
        formatter: (value) => fNumber(value),
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '16%',
      },
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Platform Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Platform Statistics */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Platform Growth"
              action={
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Metric</InputLabel>
                  <Select
                    value={chartData}
                    label="Metric"
                    onChange={handleChangeChartData}
                  >
                    <MenuItem value="Total Sellers">Total Sellers</MenuItem>
                    <MenuItem value="Active Sellers">Active Sellers</MenuItem>
                    <MenuItem value="New Registrations">New Registrations</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <CardContent>
              <Chart
                type="bar"
                series={CHART_DATA}
                options={chartOptions}
                height={320}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Total Sellers
                    </Typography>
                    <Typography variant="h3">{fNumber(1234)}</Typography>
                  </Box>
                  <Iconify icon="eva:people-fill" width={48} sx={{ color: 'primary.main' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  +2.6% from last month
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Active Sellers
                    </Typography>
                    <Typography variant="h3">{fNumber(987)}</Typography>
                  </Box>
                  <Iconify icon="eva:checkmark-circle-2-fill" width={48} sx={{ color: 'success.main' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  +1.2% from last month
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Platform Revenue
                    </Typography>
                    <Typography variant="h3">{fCurrency(45678)}</Typography>
                  </Box>
                  <Iconify icon="eva:trending-up-fill" width={48} sx={{ color: 'warning.main' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  +8.4% from last month
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Seller Registrations" />
            <CardContent>
              <Stack spacing={2}>
                {[
                  { name: 'Artisan Crafts Co.', date: '2 hours ago', status: 'Pending' },
                  { name: 'Handmade Treasures', date: '4 hours ago', status: 'Approved' },
                  { name: 'Local Creations', date: '6 hours ago', status: 'Pending' },
                  { name: 'Craft Corner', date: '8 hours ago', status: 'Approved' },
                  { name: 'Artistic Designs', date: '10 hours ago', status: 'Rejected' },
                ].map((item, index) => (
                  <Box key={index}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.date}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: item.status === 'Approved' ? 'success.main' : 
                                 item.status === 'Pending' ? 'warning.main' : 'error.main',
                        }}
                      >
                        {item.status}
                      </Typography>
                    </Stack>
                    {index < 4 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="System Alerts" />
            <CardContent>
              <Stack spacing={2}>
                {[
                  { type: 'warning', message: '3 sellers pending approval', time: '1 hour ago' },
                  { type: 'info', message: 'System maintenance scheduled', time: '2 hours ago' },
                  { type: 'success', message: 'New feature deployed', time: '4 hours ago' },
                  { type: 'error', message: 'Payment gateway issue resolved', time: '6 hours ago' },
                ].map((alert, index) => (
                  <Box key={index}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify
                        icon={
                          alert.type === 'warning' ? 'eva:alert-triangle-fill' :
                          alert.type === 'info' ? 'eva:info-fill' :
                          alert.type === 'success' ? 'eva:checkmark-circle-2-fill' :
                          'eva:close-circle-fill'
                        }
                        sx={{
                          color: alert.type === 'warning' ? 'warning.main' :
                                 alert.type === 'info' ? 'info.main' :
                                 alert.type === 'success' ? 'success.main' :
                                 'error.main',
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{alert.message}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {alert.time}
                        </Typography>
                      </Box>
                    </Stack>
                    {index < 3 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 