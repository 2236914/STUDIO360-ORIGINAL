'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { m } from 'framer-motion';
import { MotionViewport } from 'src/components/animate';
import { varContainer } from 'src/components/animate/variants';
import { useTheme } from '@mui/material/styles';

import { LandingHeader } from '../landing-header';
import { LandingHero } from '../landing-hero';
import { LandingAbout } from '../landing-about';
import { LandingStores } from '../landing-stores';
import { LandingFeatures } from '../landing-features';
import { LandingContact } from '../landing-contact';
import { LandingFooter } from '../landing-footer';

// ----------------------------------------------------------------------

export function LandingView() {
  const theme = useTheme();
  const [animationKey, setAnimationKey] = useState(0);

  // Force re-animation on page refresh
  useEffect(() => {
    setAnimationKey(Date.now());
  }, []);

  return (
    <Box>
      {/* Navigation Header */}
      <LandingHeader />

      {/* Hero Section */}
      <Box
        component={m.div}
        initial="initial"
        whileInView="animate"
        variants={varContainer()}
        viewport={{ once: false, amount: 0.3 }}
        key={`hero-${animationKey}`}
      >
        <LandingHero id="hero-section" />
      </Box>

      {/* About Section */}
      <Box
        component={m.div}
        initial="initial"
        whileInView="animate"
        variants={varContainer()}
        viewport={{ once: false, amount: 0.3 }}
        key={`about-${animationKey}`}
      >
        <LandingAbout />
      </Box>

      {/* Stores Section */}
      <Box
        component={m.div}
        initial="initial"
        whileInView="animate"
        variants={varContainer()}
        viewport={{ once: false, amount: 0.3 }}
        key={`stores-${animationKey}`}
      >
        <LandingStores />
      </Box>

      {/* Features Section */}
      <Box
        component={m.div}
        initial="initial"
        whileInView="animate"
        variants={varContainer()}
        viewport={{ once: false, amount: 0.3 }}
        key={`features-${animationKey}`}
      >
        <LandingFeatures />
      </Box>

      {/* Contact Section */}
      <Box
        component={m.div}
        initial="initial"
        whileInView="animate"
        variants={varContainer()}
        viewport={{ once: false, amount: 0.3 }}
        key={`contact-${animationKey}`}
      >
        <LandingContact />
      </Box>

      {/* Footer */}
      <LandingFooter />
    </Box>
  );
}
