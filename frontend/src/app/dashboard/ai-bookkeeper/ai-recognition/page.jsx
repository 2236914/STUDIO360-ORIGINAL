'use client';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
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
    status: 'current',
    icon: 'eva:smartphone-fill',
  },
  {
    id: 3,
    title: 'User Confirmation',
    description: 'Review and confirm AI categorization results',
    status: 'pending',
    icon: 'eva:checkmark-circle-2-fill',
  },
  {
    id: 4,
    title: 'Data Transfer',
    description: 'Transfer confirmed data to book of accounts',
    status: 'pending',
    icon: 'eva:arrow-forward-fill',
  },
];

const EXTRACTED_ITEMS = [
  {
    id: 1,
    title: 'Shopee Order #SP12345',
    suggested: 'Online Sales',
    confidence: 98,
    color: 'success',
  },
  {
    id: 2,
    title: 'Phone Case Purchase',
    suggested: 'Cost of Goods',
    confidence: 95,
    color: 'success',
  },
  {
    id: 3,
    title: 'Marketing Campaign',
    suggested: 'Marketing Expenses',
    confidence: 87,
    color: 'warning',
  },
  {
    id: 4,
    title: 'Office Supplies',
    suggested: 'Operating Expenses',
    confidence: 92,
    color: 'success',
  },
];

export default function AIRecognitionPage() {
  useEffect(() => {
    document.title = 'AI Text Recognition - AI Bookkeeper | Kitsch Studio';
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
        {/* Process Flow Steps */}
        <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Grid container spacing={3}>
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
                        color: step.status === 'current' ? 'primary.dark' : 'text.primary',
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
        </Card>

        {/* AI Text Recognition in Progress Section */}
        <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ mb: 1, fontWeight: 700 }}
          >
            AI Text Recognition in Progress
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mb: 3,
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          >
            Our AI is analyzing your documents and extracting transaction data
          </Typography>

          {/* Processing Progress */}
          <Box sx={{ mb: 4 }}>
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
                Processing Progress
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                75%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={75} 
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

          {/* Extracted Items */}
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                mb: 2,
                color: 'text.primary',
              }}
            >
              Extracted Items:
            </Typography>
            
            <Stack spacing={2}>
              {EXTRACTED_ITEMS.map((item) => (
                <Card
                  key={item.id}
                  sx={{ 
                    p: 2,
                    border: `1px solid ${theme.palette.grey[200]}`,
                    borderRadius: 1,
                  }}
                >
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 0.5,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                        }}
                      >
                        Suggested: {item.suggested}
                      </Typography>
                    </Box>
                    
                    <Chip
                      label={`${item.confidence}%`}
                      size="small"
                      sx={{ 
                        bgcolor: `${item.color}.main`,
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          px: 1.5,
                        }
                      }}
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        </Card>

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
            endIcon={<Iconify icon="eva:arrow-forward-fill" />}
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
            Next
          </Button>
        </Stack>
      </Box>
    </DashboardContent>
  );
}
