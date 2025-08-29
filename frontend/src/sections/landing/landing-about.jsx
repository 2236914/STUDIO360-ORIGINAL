'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';
import { varFade } from 'src/components/animate/variants/fade';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: 'solar:calculator-bold-duotone',
    title: 'AI-Driven Bookkeeping',
    description: 'Automated transaction categorization and real-time financial insights powered by machine learning.',
    color: 'primary',
  },
  {
    icon: 'solar:cart-large-4-bold-duotone',
    title: 'Webshop with Guest Checkout',
    description: 'Beautiful, conversion-optimized online store with seamless guest checkout for maximum sales.',
    color: 'info',
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'Tax Compliance Made Easy',
    description: 'Automatic tax calculations, reporting, and filing to keep your business compliant effortlessly.',
    color: 'success',
  },
];

// ----------------------------------------------------------------------

export function LandingAbout() {
  const theme = useTheme();

  return (
    <Box
      id="about-section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          {/* Text Content */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {/* Section Title */}
              <Stack spacing={2}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    letterSpacing: 1.2,
                  }}
                >
                  About STUDIO360
                </Typography>
                
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: 'text.primary',
                  }}
                >
                  Why STUDIO360?
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  We built STUDIO360 because creative entrepreneurs deserve tools that work as hard as they do. 
                  Our AI-powered platform handles the business complexities so you can focus on your passion.
                </Typography>
              </Stack>

              {/* Feature Cards */}
              <Stack spacing={3}>
                {FEATURES.map((feature, index) => (
                  <Card
                    component={m.div}
                    variants={varFade().inUp}
                    key={feature.title}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        transform: 'translateY(-4px)',
                        borderColor: `${feature.color}.main`,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={3}>
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette[feature.color].main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify
                          icon={feature.icon}
                          width={28}
                          color={`${feature.color}.main`}
                        />
                      </Box>

                      {/* Content */}
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Supporting Image */}
          <Grid item xs={12} md={6}>
            <Box
              component={m.div}
              variants={varFade().inLeft}
              sx={{
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {/* Main Visual */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: { xs: 300, md: 400 },
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: theme.shadows[12],
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%)`,
                  }}
                />

                {/* Central Icon */}
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Iconify
                    icon="solar:businesses-bold-duotone"
                    width={60}
                    color="primary.main"
                  />
                </Box>

                {/* Stats */}
                <Stack spacing={2} sx={{ textAlign: 'center', zIndex: 1 }}>
                  <Typography variant="h4" color="text.primary" fontWeight={700}>
                    All-in-One Solution
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Everything you need to run your business, from bookkeeping to sales
                  </Typography>
                </Stack>

                {/* Floating Elements */}
                {[
                  { icon: 'solar:pie-chart-3-bold', position: { top: 40, right: 40 }, color: 'info' },
                  { icon: 'solar:money-bag-bold', position: { bottom: 60, left: 40 }, color: 'success' },
                  { icon: 'solar:shield-check-bold', position: { top: 80, left: 60 }, color: 'warning' },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      ...item.position,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette[item.color].main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: `float 3s ease-in-out infinite ${index * 0.5}s`,
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-8px)' },
                      },
                    }}
                  >
                    <Iconify
                      icon={item.icon}
                      width={20}
                      color={`${item.color}.main`}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
