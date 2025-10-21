'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate/variants/fade';

// ----------------------------------------------------------------------

const STORES = [
  {
    id: 1,
    name: 'Artisan Crafts Co.',
    category: 'Handmade Jewelry',
    color: '#FF6B6B',
  },
  {
    id: 2,
    name: 'Digital Dreams',
    category: 'Web Design Services',
    color: '#4ECDC4',
  },
  {
    id: 3,
    name: 'Eco Living Store',
    category: 'Sustainable Products',
    color: '#45B7D1',
  },
];

// ----------------------------------------------------------------------

export function LandingStores() {
  const theme = useTheme();

  const handleVisitStore = (storeName) => {
    // In a real app, this would navigate to the store
    console.log(`Visiting store: ${storeName}`);
  };

  const handleViewAllStores = () => {
    window.location.href = '/stores';
  };

  return (
    <Box
      id="stores-section"
             sx={{
         py: { xs: 8, md: 12 },
         bgcolor: 'background.paper',
       }}
    >
      <Container maxWidth="xl">
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
              Social Proof
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
              Shops Using STUDIO360
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
              Join hundreds of successful businesses already using STUDIO360 to streamline their operations
              and boost their growth. From artisan crafters to tech startups, we power diverse businesses.
            </Typography>
          </Stack>

          {/* Store Grid */}
          <Grid container spacing={4} justifyContent="center" maxWidth="lg" sx={{ mx: 'auto' }}>
            {STORES.map((store, index) => (
              <Grid item xs={12} sm={6} md={4} key={store.id}>
                <Card
                  component={m.div}
                  variants={varFade({ distance: 60, durationIn: 0.5 }).inUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-8px)',
                    },
                  }}
                  onClick={() => handleVisitStore(store.name)}
                >
                  <Stack spacing={3} sx={{ height: '100%' }}>
                    {/* Header */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Logo */}
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: alpha(store.color, 0.15),
                          border: `2px solid ${alpha(store.color, 0.25)}`,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            color: store.color,
                            fontWeight: 700,
                          }}
                        >
                          {store.name.charAt(0)}
                        </Typography>
                      </Avatar>

                      {/* Store Info */}
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                                                 <Typography
                           variant="h6"
                           sx={{
                             fontWeight: 700,
                             color: 'text.primary',
                             fontSize: '1.1rem',
                           }}
                         >
                           {store.name}
                         </Typography>
                         <Typography
                           variant="body2"
                           sx={{
                             color: 'text.secondary',
                             fontWeight: 500,
                           }}
                         >
                           {store.category}
                         </Typography>
                      </Stack>

                      {/* Status Indicator */}
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#4caf50',
                        }}
                      />
                    </Stack>

                    

                    {/* Visit Button */}
                    <Box sx={{ mt: 'auto' }}>
                                             <Button
                         fullWidth
                         variant="outlined"
                         size="small"
                         sx={{
                           borderColor: alpha(theme.palette.grey[400], 0.4),
                           color: 'text.primary',
                           fontWeight: 500,
                           borderRadius: 1.5,
                           py: 1,
                           '&:hover': {
                             bgcolor: alpha(theme.palette.primary.main, 0.04),
                             borderColor: 'primary.main',
                             color: 'primary.main',
                           },
                         }}
                       >
                         Visit Store
                       </Button>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
                     </Grid>

                       {/* Bottom CTA */}
           <Box
             sx={{
               textAlign: 'center',
               pt: 4,
             }}
           >
                           <Stack spacing={3} alignItems="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:rocket-bold" />}
                  sx={{
                    bgcolor: 'primary.main',
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
                  Start Your Store Today
                </Button>
                
                                 <Button
                   variant="text"
                   size="medium"
                   onClick={handleViewAllStores}
                   sx={{
                     color: 'primary.main',
                     fontWeight: 500,
                     fontSize: '0.9rem',
                     '&:hover': {
                       bgcolor: alpha(theme.palette.primary.main, 0.08),
                       transform: 'translateX(4px)',
                     },
                   }}
                 >
                   See More Store
                 </Button>
              </Stack>
           </Box>
        </Stack>
      </Container>
    </Box>
  );
}
