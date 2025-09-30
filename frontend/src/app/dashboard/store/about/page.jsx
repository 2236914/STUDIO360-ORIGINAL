'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Link,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About | STUDIO360';
  }, []);

  // State for shop story section
  const [shopStory, setShopStory] = useState({
    image: null,
    title: 'Our journey in artisan craftsmanship',
    description: `Founded in 2018, Kitsch Studio emerged from a passion for creating meaningful jewelry. We are more than a shop - we are storytellers working with metal and stone.

• Email headquarters studio
• Open Tuesday to Saturday, 10am - 6pm
• Located in the creative district of Portland, Oregon`,
    email: 'hello@kitschstudio.com',
    shopHours: 'Tuesday to Saturday, 10am - 6pm',
    location: 'Portland, Oregon, USA',
  });

  // State for social media section
  const [socialMedia, setSocialMedia] = useState({
    description: 'Connect with us and join our community of jewelry lovers. Follow us for behind-the-scenes content, new arrivals, and styling inspiration.',
    platforms: [
      { id: 1, name: 'Instagram', icon: 'eva:instagram-fill', url: 'https://instagram.com/kitschstudio', color: '#E4405F' },
      { id: 2, name: 'Facebook', icon: 'eva:facebook-fill', url: 'https://facebook.com/kitschstudio', color: '#1877F2' },
      { id: 3, name: 'TikTok', icon: 'eva:video-fill', url: 'https://tiktok.com/@kitschstudio', color: '#000000' },
      { id: 4, name: 'Pinterest', icon: 'eva:pin-fill', url: 'https://pinterest.com/kitschstudio', color: '#BD081C' },
    ],
  });

  const [expanded, setExpanded] = useState('story');
  const [saveStatus, setSaveStatus] = useState('');

  // Available social platforms
  const availablePlatforms = [
    { name: 'Instagram', icon: 'eva:instagram-fill', color: '#E4405F' },
    { name: 'Facebook', icon: 'eva:facebook-fill', color: '#1877F2' },
    { name: 'TikTok', icon: 'eva:video-fill', color: '#000000' },
    { name: 'Pinterest', icon: 'eva:pin-fill', color: '#BD081C' },
    { name: 'Twitter', icon: 'eva:twitter-fill', color: '#1DA1F2' },
    { name: 'YouTube', icon: 'eva:video-outline', color: '#FF0000' },
    { name: 'LinkedIn', icon: 'eva:linkedin-fill', color: '#0A66C2' },
    { name: 'WhatsApp', icon: 'eva:message-circle-fill', color: '#25D366' },
  ];

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1000);
  };

  const addSocialPlatform = () => {
    const newPlatform = {
      id: Date.now(),
      name: 'Instagram',
      icon: 'eva:instagram-fill',
      url: '',
      color: '#E4405F',
    };
    setSocialMedia(prev => ({
      ...prev,
      platforms: [...prev.platforms, newPlatform],
    }));
  };

  const updateSocialPlatform = (id, field, value) => {
    setSocialMedia(prev => ({
      ...prev,
      platforms: prev.platforms.map(platform => {
        if (platform.id === id) {
          if (field === 'name') {
            const platformData = availablePlatforms.find(p => p.name === value);
            return {
              ...platform,
              name: value,
              icon: platformData?.icon || platform.icon,
              color: platformData?.color || platform.color,
            };
          }
          return { ...platform, [field]: value };
        }
        return platform;
      }),
    }));
  };

  const deleteSocialPlatform = (id) => {
    setSocialMedia(prev => ({
      ...prev,
      platforms: prev.platforms.filter(platform => platform.id !== id),
    }));
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="About"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store', href: paths.dashboard.store.root },
          { name: 'About' },
        ]}
        action={
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:external-link-fill" />}
            onClick={() => window.open('/stores/your-store-id/about', '_blank')}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:save-fill" />}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Save Status Alert */}
      {saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          About page changes saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Editor Panel */}
        <Grid item xs={12} md={8}>
          {/* Section 1: Shop Story */}
          <Accordion 
            expanded={expanded === 'story'} 
            onChange={handleAccordionChange('story')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:book-open-fill" sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Shop Story Section</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Story Image Upload */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    About Us Image
                  </Typography>
                  <Stack spacing={1.5}>
                    <Upload
                      value={shopStory.image}
                      onDrop={(acceptedFiles) => {
                        const file = acceptedFiles[0];
                        if (file) {
                          setShopStory(prev => ({ ...prev, image: file }));
                        }
                      }}
                      sx={{ 
                        minHeight: 200,
                        '& > div': {
                          minHeight: 200,
                        }
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Or paste image URL"
                        placeholder="https://example.com/about.jpg"
                        value={typeof shopStory.image === 'string' ? shopStory.image : ''}
                        onChange={(e) => setShopStory(prev => ({ ...prev, image: e.target.value }))}
                      />
                      <Button variant="outlined" size="small">Use URL</Button>
                    </Stack>
                  </Stack>
                </Box>

                {/* Title and Description */}
                <TextField
                  fullWidth
                  label="Story Title"
                  value={shopStory.title}
                  onChange={(e) => setShopStory(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ mt: 2 }}
                />

                <TextField
                  fullWidth
                  label="Story Description"
                  value={shopStory.description}
                  onChange={(e) => setShopStory(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={8}
                  helperText="Use bullet points (•) to highlight key information"
                  sx={{ mt: 2 }}
                />

                {/* Store Details */}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Store Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={shopStory.email}
                      onChange={(e) => setShopStory(prev => ({ ...prev, email: e.target.value }))}
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Shop Hours"
                      value={shopStory.shopHours}
                      onChange={(e) => setShopStory(prev => ({ ...prev, shopHours: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={shopStory.location}
                      onChange={(e) => setShopStory(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 2: Social Media & Community */}
          <Accordion 
            expanded={expanded === 'social'} 
            onChange={handleAccordionChange('social')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:share-fill" sx={{ color: 'info.main' }} />
                <Typography variant="h6">Social Media & Community</Typography>
                <Chip 
                  label={`${socialMedia.platforms.length} platforms`}
                  size="small" 
                  color="info" 
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Description */}
                <TextField
                  fullWidth
                  label="Social Media Description"
                  value={socialMedia.description}
                  onChange={(e) => setSocialMedia(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  helperText="Describe how customers can connect with you on social media"
                  sx={{ mt: 1 }}
                />

                {/* Social Media Platforms */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Social Media Links
                  </Typography>
                  
                  <Stack spacing={2}>
                    {socialMedia.platforms.map((platform, index) => (
                      <Card key={platform.id} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: `${platform.color}20`,
                                  color: platform.color,
                                }}
                              >
                                <Iconify icon={platform.icon} width={16} />
                              </Box>
                              <Typography variant="subtitle2">
                                Social Platform #{index + 1}
                              </Typography>
                            </Stack>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => deleteSocialPlatform(platform.id)}
                            >
                              <Iconify icon="eva:trash-2-fill" />
                            </IconButton>
                          </Stack>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <FormControl fullWidth>
                                <InputLabel>Platform</InputLabel>
                                <Select
                                  value={platform.name}
                                  label="Platform"
                                  onChange={(e) => updateSocialPlatform(platform.id, 'name', e.target.value)}
                                >
                                  {availablePlatforms.map((p) => (
                                    <MenuItem key={p.name} value={p.name}>
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon={p.icon} sx={{ color: p.color }} />
                                        <Typography>{p.name}</Typography>
                                      </Stack>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={8}>
                              <TextField
                                fullWidth
                                label="Profile URL"
                                value={platform.url}
                                onChange={(e) => updateSocialPlatform(platform.id, 'url', e.target.value)}
                                placeholder={`https://${platform.name.toLowerCase()}.com/yourusername`}
                              />
                            </Grid>
                          </Grid>
                        </Stack>
                      </Card>
                    ))}
                    
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={addSocialPlatform}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add Social Platform
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Live Preview
            </Typography>
            
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              {/* Shop Story Preview */}
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    height: 100,
                    bgcolor: 'background.neutral',
                    borderRadius: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:image-fill" sx={{ color: 'text.disabled', fontSize: 24 }} />
                </Box>
                
                <Typography variant="subtitle1" sx={{ mb: 1, fontSize: 14, fontWeight: 600 }}>
                  {shopStory.title}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, fontSize: 12, color: 'text.secondary' }}>
                  {shopStory.description.substring(0, 120)}...
                </Typography>
                
                {/* Store Details Preview */}
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="eva:email-fill" sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption">{shopStory.email}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="eva:clock-fill" sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption">{shopStory.shopHours}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="eva:pin-fill" sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption">{shopStory.location}</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Social Media Preview */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>
                  Socials & Community
                </Typography>
                
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                  {socialMedia.description.substring(0, 80)}...
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {socialMedia.platforms.filter(p => p.url).slice(0, 4).map((platform) => (
                    <Box
                      key={platform.id}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${platform.color}20`,
                        color: platform.color,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: `${platform.color}40`,
                        },
                      }}
                    >
                      <Iconify icon={platform.icon} width={14} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
            
            {/* Tips Section */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Iconify icon="eva:bulb-fill" sx={{ color: 'info.main', mt: 0.5, fontSize: 16 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'info.main', fontSize: 12 }}>
                    Tips for About Page
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'info.dark' }}>
                    • Tell your story authentically
                    • Include high-quality photos
                    • Add clear contact information
                    • Link active social accounts
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
