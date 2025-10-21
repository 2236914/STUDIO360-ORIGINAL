'use client';

import { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Alert,
  Button,
  Select,
  Divider,
  MenuItem,
  TextField,
  Accordion,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { DashboardContent } from 'src/layouts/dashboard';
import { aboutPageApi } from 'src/services/storePagesService';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function AboutPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const confirmDialog = useBoolean();
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    document.title = 'About | STUDIO360';
    loadAboutData();
  }, []);

  // Load about page data from database
  const loadAboutData = async () => {
    try {
      setLoading(true);
      const data = await aboutPageApi.getCompleteAboutData();
      
      console.log('Loaded about page data:', data);
      
      // Populate shop story
      if (data.shopStory) {
        setShopStory({
          image: null, // Image URLs will be handled separately
          title: data.shopStory.title || '',
          description: data.shopStory.description || '',
          email: data.shopStory.email || '',
          shopHours: data.shopStory.shop_hours || '',
          location: data.shopStory.location || '',
        });
      }
      
      // Populate social media
      if (data.socialMedia) {
        setSocialMedia(prev => ({
          ...prev,
          description: data.socialMedia.description || '',
        }));
      }
      
      // Populate social platforms
      if (data.socialPlatforms && Array.isArray(data.socialPlatforms)) {
        const formattedPlatforms = data.socialPlatforms.map(platform => {
          const platformData = availablePlatforms.find(p => p.name.toLowerCase() === platform.platform_name.toLowerCase());
          return {
            id: platform.id,
            name: platform.platform_name,
            icon: platformData?.icon || 'eva:link-2-fill',
            url: platform.platform_url,
            color: platformData?.color || '#000000',
            display_order: platform.display_order,
          };
        });
        setSocialMedia(prev => ({
          ...prev,
          platforms: formattedPlatforms,
        }));
      }
      
      setInitialLoad(false);
      toast.success('About page data loaded successfully!');
    } catch (error) {
      console.error('Error loading about page data:', error);
      toast.error('Failed to load about page data. Using empty defaults.');
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // State for shop story section
  const [shopStory, setShopStory] = useState({
    image: null,
    title: '',
    description: '',
    email: '',
    shopHours: '',
    location: '',
  });

  // State for social media section
  const [socialMedia, setSocialMedia] = useState({
    description: '',
    platforms: [],
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

  const handleSave = async () => {
    try {
    setSaveStatus('saving');
      setLoading(true);
      
      // Save shop story
      await aboutPageApi.updateShopStory({
        title: shopStory.title,
        description: shopStory.description,
        email: shopStory.email,
        shop_hours: shopStory.shopHours,
        location: shopStory.location,
      });
      
      // Save social media description
      await aboutPageApi.updateSocialMedia({
        description: socialMedia.description,
      });
      
      // Save or update each social platform
      for (const platform of socialMedia.platforms) {
        if (typeof platform.id === 'string' && platform.id.length > 20) {
          // Existing platform (UUID from database)
          await aboutPageApi.updateSocialPlatform(platform.id, {
            platform_name: platform.name,
            platform_url: platform.url,
            icon_name: platform.icon,
            display_order: platform.display_order || 0,
          });
        } else {
          // New platform (temporary numeric ID)
          await aboutPageApi.createSocialPlatform({
            platform_name: platform.name,
            platform_url: platform.url,
            icon_name: platform.icon,
            display_order: platform.display_order || 0,
          });
        }
      }
      
      setSaveStatus('saved');
      toast.success('About page saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      
      // Reload to get updated IDs from database
      await loadAboutData();
    } catch (error) {
      console.error('Error saving about page:', error);
      toast.error('Failed to save about page. Please try again.');
      setSaveStatus('');
    } finally {
      setLoading(false);
    }
  };

  const addSocialPlatform = () => {
    const newPlatform = {
      id: Date.now(), // Temporary ID for new platforms
      name: 'Instagram',
      icon: 'eva:instagram-fill',
      url: '',
      color: '#E4405F',
      display_order: socialMedia.platforms.length,
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

  const confirmDeleteSocialPlatform = (id) => {
    setDeleteItem(id);
    confirmDialog.onTrue();
  };

  const deleteSocialPlatform = async () => {
    try {
      const platformId = deleteItem;
      
      // If it's a database platform (UUID), delete from database
      if (typeof platformId === 'string' && platformId.length > 20) {
        setLoading(true);
        await aboutPageApi.deleteSocialPlatform(platformId);
        toast.success('Social platform deleted successfully!');
      }
      
      // Remove from local state
    setSocialMedia(prev => ({
      ...prev,
        platforms: prev.platforms.filter(platform => platform.id !== platformId),
      }));
      
      confirmDialog.onFalse();
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting social platform:', error);
      toast.error('Failed to delete social platform. Please try again.');
    } finally {
      setLoading(false);
    }
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
                              onClick={() => confirmDeleteSocialPlatform(platform.id)}
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete Social Platform"
        content="Are you sure you want to delete this social media platform? This action cannot be undone."
        action={
          <Button 
            variant="contained" 
            color="error" 
            onClick={deleteSocialPlatform}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />
    </DashboardContent>
  );
}
