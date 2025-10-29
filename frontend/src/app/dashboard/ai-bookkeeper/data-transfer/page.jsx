'use client';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PROCESS_STEPS = [
  {
    id: 1,
    title: 'Data Input',
    description: 'Upload receipts, sales data, or Excel files',
    status: 'completed',
    icon: 'eva:file-add-fill',
  },
  {
    id: 2,
    title: 'AI Recognition',
    description: 'AI processes and recognizes text from documents',
    status: 'completed',
    icon: 'eva:smartphone-fill',
  },
  {
    id: 3,
    title: 'User Confirmation',
    description: 'Review and confirm AI categorization results',
    status: 'completed',
    icon: 'eva:checkmark-circle-2-fill',
  },
  {
    id: 4,
    title: 'Data Transfer',
    description: 'Transfer confirmed data to book of accounts',
    status: 'current',
    icon: 'eva:arrow-forward-fill',
  },
];

const TRANSFERRED_CATEGORIES = [
  'Online Sales Revenue',
  'Cost of Goods Sold',
  'Marketing Expenses',
  'Operating Expenses',
];

export default function DataTransferPage() {
  useEffect(() => {
    document.title = 'Data Transfer - AI Bookkeeper | Kitsch Studio';
  }, []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getStepColor = (status) => {
    switch (status) {
      case 'current':
        return 'primary.dark';
      case 'completed':
        return 'success.main';
      case 'pending':
        return 'grey.400';
      default:
        return 'grey.400';
    }
  };

  const getStepIcon = (step) => {
    if (step.status === 'completed') {
      return 'eva:checkmark-circle-2-fill';
    }
    return step.icon;
  };

  return (
    <DashboardContent>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Process Progress Section */}
        <Card 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 3,
            bgcolor: 'primary.lighter',
            border: `1px solid ${theme.palette.primary.light}`,
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Process Progress
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'primary.dark',
                  fontWeight: 500,
                }}
              >
                Step 4 of 4 • 3 completed
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              sx={{
                bgcolor: 'primary.dark',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'primary.darker',
                }
              }}
            >
              75% Complete
            </Button>
          </Stack>
        </Card>

        {/* Main Process Flow Section */}
        <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ mb: 3, fontWeight: 700 }}
          >
            Process Flow
          </Typography>

          {/* Process Steps */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {PROCESS_STEPS.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={step.id}>
                <Stack 
                  alignItems="center" 
                  spacing={2}
                  sx={{ 
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Step Icon */}
                  <Avatar 
                    sx={{ 
                      bgcolor: getStepColor(step.status),
                      width: { xs: 48, md: 56 },
                      height: { xs: 48, md: 56 },
                      color: step.status === 'current' ? 'white' : 'grey.700',
                    }}
                  >
                    <Iconify 
                      icon={getStepIcon(step)} 
                      width={isMobile ? 24 : 28} 
                    />
                  </Avatar>

                  {/* Step Content */}
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 700,
                        mb: 0.5,
                        color: step.status === 'completed' ? 'success.main' : 'text.primary',
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Transfer to Book of Accounts Section */}
          <Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ mb: 1, fontWeight: 700 }}
            >
              Transfer to Book of Accounts
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                mb: 3,
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}
            >
              Transferring confirmed transactions to your bookkeeping system
            </Typography>

            {/* Transfer Progress */}
            <Stack spacing={3}>
              <Box>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  sx={{ mb: 1 }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    Transfer Progress
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'success.main',
                    }}
                  >
                    4/4 completed
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: 'success.main',
                    }
                  }} 
                />
              </Box>

              {/* Transferred Categories */}
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 1.5,
                  }}
                >
                  Transferred Categories:
                </Typography>
                
                <Stack 
                  direction="row" 
                  spacing={1} 
                  flexWrap="wrap"
                  useFlexGap
                >
                  {TRANSFERRED_CATEGORIES.map((category, index) => (
                    <Chip
                      key={index}
                      label={category}
                      size="small"
                      sx={{ 
                        bgcolor: 'success.main',
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiChip-label': {
                          px: 1.5,
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* Success Message */}
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-icon': {
              color: 'success.main',
            }
          }}
        >
          All transactions have been successfully transferred to your Book of Accounts!
        </Alert>

        {/* Action Buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => window.history.back()}
            sx={{ 
              minWidth: { xs: '100%', sm: 120 },
              height: 48,
              fontWeight: 600,
            }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            endIcon={<Iconify icon="eva:checkmark-fill" />}
            sx={{ 
              minWidth: { xs: '100%', sm: 120 },
              height: 48,
              fontWeight: 600,
              bgcolor: 'grey.800',
              '&:hover': {
                bgcolor: 'grey.900',
              }
            }}
          >
            Finish
          </Button>
        </Stack>
      </Box>
    </DashboardContent>
  );
}
