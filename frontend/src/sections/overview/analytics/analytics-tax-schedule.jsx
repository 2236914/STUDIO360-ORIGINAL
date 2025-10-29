'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AnalyticsTaxSchedule() {
  const [selectedPeriod, setSelectedPeriod] = useState('1st Quarter');

  // Hardcoded tax filing schedule data
  const taxScheduleData = [
    {
      period: '1st Quarter',
      birForms: '1701Qv2018',
      alphaslistEsub: 'SAWT',
      coverageSalesExpenses: 'Jan 1 to Mar 31, 2025',
      deadline: 'May 15, 2025',
      filingWindow: 'Apr 1 to May 15, 2025',
      isCurrent: true,
      isHighlighted: true
    },
    {
      period: '2nd Quarter',
      birForms: '1701Qv2018',
      alphaslistEsub: 'SAWT',
      coverageSalesExpenses: 'Apr 1 to Jun 30, 2025',
      deadline: 'Aug 15, 2025',
      filingWindow: 'Jul 1 to Aug 15, 2025',
      isCurrent: false,
      isHighlighted: false
    },
    {
      period: '3rd Quarter',
      birForms: '1701Qv2018',
      alphaslistEsub: 'SAWT',
      coverageSalesExpenses: 'Jul 1 to Sep 30, 2025',
      deadline: 'Nov 15, 2025',
      filingWindow: 'Oct 1 to Nov 15, 2025',
      isCurrent: false,
      isHighlighted: false
    },
    {
      period: 'Annual',
      birForms: '1701A or 1701v2018',
      alphaslistEsub: 'SAWT',
      coverageSalesExpenses: 'Jan 1 to Dec 31, 2025',
      deadline: 'Apr 15, 2026',
      filingWindow: 'Jan 1 to Apr 15, 2026',
      isCurrent: false,
      isHighlighted: false
    }
  ];

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
  };

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'info.main',
            mr: 2,
          }}
        >
          <Iconify icon="eva:calendar-outline" width={24} sx={{ color: 'white' }} />
        </Avatar>
        
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            Tax Filing Schedule
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            BIR Forms & Deadlines 2025-2026
          </Typography>
        </Box>
      </Stack>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Period</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>BIR Forms</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Alphaslist eSub</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Coverage Sales & Expenses</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Deadline</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Kelan pwede mag file & pay?</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxScheduleData.map((row) => (
              <TableRow
                key={row.period}
                sx={{
                  bgcolor: row.isHighlighted ? 'warning.lighter' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox
                      checked={selectedPeriod === row.period}
                      onChange={() => handlePeriodSelect(row.period)}
                      size="small"
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.period}
                    </Typography>
                    {row.isCurrent && (
                      <Tooltip title="Current Period">
                        <Iconify icon="eva:star-fill" width={16} sx={{ color: 'warning.main' }} />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.birForms}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.alphaslistEsub}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {row.coverageSalesExpenses}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {row.deadline}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.filingWindow}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Info */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:info-outline" width={16} sx={{ color: 'info.main' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Selected: {selectedPeriod} • Yellow highlight indicates current filing period
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}
