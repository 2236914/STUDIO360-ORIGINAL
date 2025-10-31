'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { seoSettingsApi } from 'src/services/seoSettingsService';

export const metadata = {
  title: 'SEO Settings',
  description: 'Manage your default SEO metadata for the storefront.',
  robots: { index: false, follow: false },
};

export default function StoreSeoSettingsPage() {
  const methods = useForm({
    defaultValues: {
      title: '',
      description: '',
      socialTitle: '',
      socialDescription: '',
      socialImageUrl: '',
      canonicalUrl: '',
    },
  });

  const { reset, handleSubmit } = methods;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await seoSettingsApi.get().catch(() => null);
        if (data) {
          reset({
            title: data.title || '',
            description: data.description || '',
            socialTitle: data.social_title || '',
            socialDescription: data.social_description || '',
            socialImageUrl: data.social_image_url || '',
            canonicalUrl: data.canonical_url || '',
          });
        }
      } catch (e) {
        console.log('SEO settings load skipped:', e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);
      await seoSettingsApi.update({
        title: values.title,
        description: values.description,
        social_title: values.socialTitle,
        social_description: values.socialDescription,
        social_image_url: values.socialImageUrl,
        canonical_url: values.canonicalUrl,
      }).catch(() => null);
      toast.success('SEO settings saved');
    } catch (e) {
      toast.error(e?.message || 'Failed to save SEO settings');
    } finally {
      setLoading(false);
    }
  });

  return (
    <DashboardContent maxWidth="md">
      <CustomBreadcrumbs
        heading="SEO Settings"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store', href: '/dashboard/store' },
          { name: 'SEO' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Defaults</Typography>
              <TextField label="Default Title" {...methods.register('title')} fullWidth />
              <TextField label="Default Meta Description" {...methods.register('description')} fullWidth multiline rows={3} />
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Social Sharing</Typography>
              <TextField label="Social Title (OG/Twitter)" {...methods.register('socialTitle')} fullWidth />
              <TextField label="Social Description" {...methods.register('socialDescription')} fullWidth multiline rows={3} />
              <TextField label="Social Image URL (1200x630)" {...methods.register('socialImageUrl')} fullWidth />
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Advanced</Typography>
              <TextField label="Canonical URL (optional)" {...methods.register('canonicalUrl')} fullWidth />
            </Stack>
          </Card>

          <Box>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Stack>
      </Form>
    </DashboardContent>
  );
}


