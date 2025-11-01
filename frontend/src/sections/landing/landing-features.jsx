'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate/variants/fade';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: 'solar:calculator-minimalistic-bold-duotone',
    title: 'Bookkeeping Automation',
    description: 'AI-powered transaction categorization, automated reconciliation, and intelligent expense tracking that learns from your business patterns.',
    color: 'primary',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    icon: 'solar:chart-square-bold-duotone',
    title: 'Dashboard & Reports',
    description: 'Real-time business insights with customizable dashboards, automated reports, and performance analytics to drive growth.',
    color: 'info',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    icon: 'solar:graph-up-bold-duotone',
    title: 'AI Sales Forecasting',
    description: 'Predictive analytics powered by machine learning to forecast sales trends, inventory needs, and revenue projections.',
    color: 'success',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'Secure Payments',
    description: 'Enterprise-grade security with encrypted transactions, PCI compliance, and fraud protection for peace of mind.',
    color: 'warning',
    gradient: ['#fa709a', '#fee140'],
  },
];

// ----------------------------------------------------------------------

export function LandingFeatures() {
  const theme = useTheme();

  return (
    <Box
      id="features-section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Stack spacing={8}>
          {/* Header */}
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              Platform Features
            </Typography>
            
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                lineHeight: 1.3,
                color: 'text.primary',
                maxWidth: 600,
              }}
            >
              All-in-One Platform
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 800,
              }}
            >
              Everything you need to run a successful business, from advanced bookkeeping automation 
              to AI-powered insights—all integrated seamlessly in one powerful platform.
            </Typography>
          </Stack>

          {/* Features Grid */}
          <Grid container spacing={4}>
            {FEATURES.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card
                  component={m.div}
                  variants={varFade({ distance: 80, durationIn: 0.6 }).inUp}
                  whileHover={{ 
                    y: -12, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transition: { duration: 0.3 } 
                  }}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
                      opacity: 0.8,
                    },
                    '&:hover': {
                      boxShadow: theme.shadows[16],
                      transform: 'translateY(-12px)',
                      borderColor: alpha(theme.palette[feature.color].main, 0.3),
                      '&::before': {
                        height: 6,
                        opacity: 1,
                      },
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                      '& .feature-content': {
                        transform: 'translateY(-4px)',
                      },
                    },
                  }}
                >
                  <Stack spacing={3} sx={{ height: '100%' }}>
                    {/* Icon */}
                    <Box
                      className="feature-icon"
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${alpha(feature.gradient[0], 0.1)}, ${alpha(feature.gradient[1], 0.1)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 'inherit',
                          background: `linear-gradient(135deg, ${alpha(feature.gradient[0], 0.2)}, ${alpha(feature.gradient[1], 0.2)})`,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::before': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Iconify
                        icon={feature.icon}
                        width={36}
                        sx={{
                          background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <Stack 
                      spacing={2} 
                      className="feature-content"
                      sx={{ 
                        flex: 1,
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '1.25rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.7,
                          fontSize: '0.95rem',
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Stack>

                    {/* Learn More Link */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'primary.main',
                        typography: 'subtitle2',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'primary.dark',
                          '& .arrow': {
                            transform: 'translateX(4px)',
                          },
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mr: 1,
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Learn more
                      </Typography>
                      <Iconify
                        icon="solar:arrow-right-bold"
                        width={16}
                        className="arrow"
                        sx={{
                          transition: 'transform 0.2s ease',
                          background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                        }}
                      />
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Bottom Section */}
          <Box
            sx={{
              textAlign: 'center',
              pt: 4,
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Typography
                variant="h5"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  maxWidth: 600,
                }}
              >
                Ready to experience the power of STUDIO360?
              </Typography>
              
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    typography: 'body2',
                  }}
                >
                  <Iconify icon="solar:check-circle-bold" color="success.main" sx={{ mr: 1 }} />
                  14-day free trial
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    typography: 'body2',
                  }}
                >
                  <Iconify icon="solar:check-circle-bold" color="success.main" sx={{ mr: 1 }} />
                  No credit card required
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    typography: 'body2',
                  }}
                >
                  <Iconify icon="solar:check-circle-bold" color="success.main" sx={{ mr: 1 }} />
                  Cancel anytime
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
