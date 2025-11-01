'use client';

import { m } from 'framer-motion';
import NProgress from 'nprogress';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate/variants/fade';

// ----------------------------------------------------------------------

export function LandingHero({ id, ...other }) {
  const theme = useTheme();
  const router = useRouter();

  const handleGetStarted = () => {
    NProgress.start();
    router.push(paths.auth.jwt.signUp);
  };

  const handleExploreStores = () => {
    router.push('/stores');
  };

  return (
    <Box
        id={id}
        sx={{
          pt: 0,
          pb: { xs: 8, md: 12 },
          bgcolor: 'background.paper',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        }}
        {...other}
      >
      <Container maxWidth="xl" sx={{ mt: 0, pt: 0, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          {/* Text Content */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4} sx={{ pt: 4 }}>
              {/* Badge */}
              <Box
                component={m.div}
                variants={varFade().inUp}
                sx={{
                  display: 'inline-flex',
                  px: 2,
                  py: 0.75,
                  mt: 8, // Add top margin for spacing from floating nav
                  borderRadius: 20,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  typography: 'caption',
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                  border: theme.palette.mode === 'dark' 
                    ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    : 'none',
                }}
              >
                🚀&nbsp;&nbsp;Now in Beta - Join Early Adopters
              </Box>

              {/* Headline */}
              <Typography
                component={m.h1}
                variants={varFade().inUp}
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'text.primary',
                }}
              >
                AI-Powered Business Management for{' '}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Creative Entrepreneurs
                </Box>
              </Typography>

              {/* Subtext */}
              <Typography
                component={m.p}
                variants={varFade().inUp}
                variant="h5"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                Simplify your shop, track sales, and stay compliant—all in one platform.
                Built for modern businesses who want to focus on what they do best.
              </Typography>

              {/* CTA Buttons */}
              <Stack
                component={m.div}
                variants={varFade().inUp}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ pt: 2 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  startIcon={<Iconify icon="solar:rocket-bold-duotone" />}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: theme.shadows[8],
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      boxShadow: theme.shadows[12],
                    },
                  }}
                >
                  Get Started Free
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleExploreStores}
                  startIcon={<Iconify icon="solar:shop-bold-duotone" />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: 'primary.dark',
                    },
                  }}
                >
                  Explore Stores
                </Button>
              </Stack>

              {/* Trust Indicators */}
              <Stack
                component={m.div}
                variants={varFade().inUp}
                direction="row"
                spacing={4}
                sx={{
                  pt: 3,
                  color: 'text.secondary',
                  typography: 'body2',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:shield-check-bold" color="success.main" />
                  <Typography variant="caption">SOC 2 Compliant</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:users-group-rounded-bold" color="primary.main" />
                  <Typography variant="caption">500+ Businesses</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:star-bold" color="warning.main" />
                  <Typography variant="caption">4.9/5 Rating</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>

          {/* Dashboard Mockup */}
          <Grid item xs={12} md={6}>
            <Box
              component={m.div}
              variants={varFade().inRight}
              sx={{
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {/* Placeholder for Dashboard Mockup */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: { xs: 300, md: 400 },
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: theme.shadows[20],
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  mx: 'auto',
                }}
              >
                {/* Dashboard Preview Content */}
                <Stack spacing={2} sx={{ width: '100%' }}>
                  {/* Header */}
                  <Box
                    sx={{
                      height: 40,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="primary.main">
                      STUDIO360 Dashboard
                    </Typography>
                  </Box>

                  {/* Content Grid */}
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          height: 80,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="h6" color="success.main">
                          $24.5K
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Revenue
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          height: 80,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="h6" color="primary.main">
                          147
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Orders
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Chart Placeholder */}
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: alpha(theme.palette.grey[500], 0.08),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify
                      icon="solar:chart-square-bold-duotone"
                      width={48}
                      color="text.disabled"
                    />
                  </Box>
                </Stack>

                {/* Floating Elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:graph-up-bold" color="primary.main" width={24} />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
              </Container>
    </Box>
  );
}
