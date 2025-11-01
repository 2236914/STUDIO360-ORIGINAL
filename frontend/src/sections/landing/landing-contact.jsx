'use client';

import { useState } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate/variants/fade';

// ----------------------------------------------------------------------

const SOCIAL_LINKS = [
  {
    name: 'Twitter',
    icon: 'eva:twitter-fill',
    url: 'https://twitter.com',
    color: '#1DA1F2',
  },
  {
    name: 'LinkedIn',
    icon: 'eva:linkedin-fill',
    url: 'https://linkedin.com',
    color: '#0077B5',
  },
  {
    name: 'Facebook',
    icon: 'eva:facebook-fill',
    url: 'https://facebook.com',
    color: '#1877F2',
  },
  {
    name: 'Instagram',
    icon: 'ant-design:instagram-filled',
    url: 'https://instagram.com',
    color: '#E4405F',
  },
  {
    name: 'GitHub',
    icon: 'eva:github-fill',
    url: 'https://github.com',
    color: '#333333',
  },
];

// ----------------------------------------------------------------------

export function LandingContact() {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Form submitted:', formData);
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
    
    // In a real app, you would show a success message
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      id="contact-section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
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
          background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          {/* Left Side - Info */}
          <Grid item xs={12} md={6}>
            <Stack 
              component={m.div}
              variants={varFade().inLeft}
              spacing={4}
            >
              {/* Header */}
              <Stack spacing={3}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    letterSpacing: 1.2,
                  }}
                >
                  Get in Touch
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
                  Let's Connect
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Have questions about STUDIO360? Want to see a demo? Or just want to chat about 
                  how we can help grow your business? We'd love to hear from you.
                </Typography>
              </Stack>

              {/* Contact Info */}
              <Stack spacing={3}>
                {[
                  {
                    icon: 'solar:letter-bold-duotone',
                    title: 'Email us',
                    description: 'hello@studio360.dev',
                    color: 'primary',
                  },
                  {
                    icon: 'solar:phone-bold-duotone',
                    title: 'Call us',
                    description: '+639 939637674',
                    color: 'info',
                  },
                  {
                    icon: 'solar:map-point-bold-duotone',
                    title: 'Visit us',
                    description: 'BSU Lipa Campus',
                    color: 'success',
                  },
                ].map((item, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette[item.color].main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify
                        icon={item.icon}
                        width={24}
                        color={`${item.color}.main`}
                      />
                    </Box>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'text.primary',
                          fontWeight: 600,
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
                        {item.description}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              {/* Social Links */}
              <Stack spacing={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  Follow us
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  {SOCIAL_LINKS.map((social, index) => (
                    <IconButton
                      key={social.name}
                      onClick={() => handleSocialClick(social.url)}
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: alpha(social.color, 0.1),
                        color: social.color,
                        border: `1px solid ${alpha(social.color, 0.2)}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: social.color,
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(social.color, 0.3)}`,
                        },
                      }}
                    >
                      <Iconify icon={social.icon} width={20} />
                    </IconButton>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Grid>

          {/* Right Side - Contact Form */}
          <Grid item xs={12} md={6}>
            <Card
              component={m.div}
              variants={varFade().inRight}
              sx={{
                p: 4,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                boxShadow: theme.shadows[12],
              }}
            >
              <Stack spacing={3}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    textAlign: 'center',
                  }}
                >
                  Send us a message
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Name Field */}
                    <TextField
                      fullWidth
                      label="Your Name"
                      value={formData.name}
                      onChange={handleChange('name')}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />

                    {/* Email Field */}
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />

                    {/* Message Field */}
                    <TextField
                      fullWidth
                      label="Your Message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleChange('message')}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <Iconify icon="solar:loader-3-bold" className="animate-spin" />
                        ) : (
                          <Iconify icon="solar:letter-bold" />
                        )
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: 'primary.main',
                        boxShadow: theme.shadows[8],
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          boxShadow: theme.shadows[12],
                        },
                        '&:disabled': {
                          bgcolor: alpha(theme.palette.primary.main, 0.6),
                        },
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Stack>
                </Box>

                {/* Bottom Note */}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  We typically respond within 24 hours. Your information is secure and never shared.
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
