'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Rating from '@mui/material/Rating';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { LandingHeader } from 'src/sections/landing/landing-header';
import { LandingFooter } from 'src/sections/landing/landing-footer';

// ----------------------------------------------------------------------

const ALL_STORES = [
  { id: 1, name: 'Artisan Crafts Co.', category: 'Handmade Jewelry', color: '#FF6B6B', createdAt: '2025-06-03T10:00:00Z', rating: 4.8 },
  { id: 2, name: 'Digital Dreams', category: 'Web Design Services', color: '#4ECDC4', createdAt: '2025-05-22T15:30:00Z', rating: 4.6 },
  { id: 3, name: 'Eco Living Store', category: 'Sustainable Products', color: '#45B7D1', createdAt: '2025-04-10T08:15:00Z', rating: 4.7 },
  { id: 4, name: 'Urban Threads', category: 'Apparel & Fashion', color: '#8E44AD', createdAt: '2025-06-18T12:45:00Z', rating: 4.5 },
  { id: 5, name: 'Green Kitchen', category: 'Organic Food', color: '#27AE60', createdAt: '2025-03-28T09:20:00Z', rating: 4.4 },
  { id: 6, name: 'Pixel Forge', category: 'Digital Products', color: '#3498DB', createdAt: '2025-06-26T18:05:00Z', rating: 4.9 },
  { id: 7, name: 'Kitsch Studio', category: 'Handmade Gift Shop', color: '#F39C12', createdAt: '2025-07-01T10:00:00Z', rating: 4.8 },
];

// ----------------------------------------------------------------------

export default function StoresPage() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  const categories = useMemo(() => {
    const set = new Set(ALL_STORES.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredStores = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const base = ALL_STORES.filter((s) => {
      const matchesQuery = lower === '' || s.name.toLowerCase().includes(lower) || s.category.toLowerCase().includes(lower);
      const matchesCategory = category === 'all' || s.category === category;
      return matchesQuery && matchesCategory;
    });

    const sorted = [...base].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      if (sort === 'newest') return bTime - aTime;
      if (sort === 'oldest') return aTime - bTime;
      return 0;
    });

    return sorted;
  }, [query, category, sort]);

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <LandingHeader />

      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Stack spacing={4} alignItems="center" textAlign="center" sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.2 }}>
              Discover Stores
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              All Stores
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 800 }}>
              Browse a curated selection of shops powered by STUDIO360.
            </Typography>
          </Stack>

          {/* Controls */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 4 }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              fullWidth
              size="medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stores or categories..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={20} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                },
              }}
            />

            <FormControl size="medium" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
              <InputLabel shrink id="stores-category-label">
                Category
              </InputLabel>
              <Select
                labelId="stores-category-label"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                }}
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="medium" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <InputLabel shrink id="stores-sort-label">
                Sort
              </InputLabel>
              <Select
                labelId="stores-sort-label"
                label="Sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                sx={{ borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Grid container spacing={4}>
            {filteredStores.map((store) => (
              <Grid key={store.id} item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)', transform: 'translateY(-6px)' },
                  }}
                >
                  <Stack spacing={2.5} sx={{ height: '100%' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(store.color, 0.15), border: `2px solid ${alpha(store.color, 0.25)}` }}>
                        <Typography variant="h6" sx={{ color: store.color, fontWeight: 700 }}>
                          {store.name.charAt(0)}
                        </Typography>
                      </Avatar>
                      <Stack sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {store.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {store.category}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
                      <Rating value={store.rating} precision={0.1} readOnly size="small" />
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={`/${store.name.toLowerCase().replace(/\s+/g, '')}`}
                        sx={{
                          minWidth: 96,
                          px: 2,
                          borderColor: alpha(theme.palette.grey[400], 0.4),
                          color: 'text.primary',
                          fontWeight: 600,
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: 'primary.main', color: 'primary.main' },
                        }}
                      >
                        Store
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            ))}
            {filteredStores.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                    No stores found.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}


