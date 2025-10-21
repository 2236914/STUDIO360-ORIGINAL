'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { ImageCropTest } from 'src/components/image-crop-modal';
import { SimpleCropTest } from 'src/components/image-crop-modal/simple-test';

// ----------------------------------------------------------------------

export default function ImageCropTestPage() {
  const [showSimple, setShowSimple] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Image Crop Test Page
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant={showSimple ? 'outlined' : 'contained'}
          onClick={() => setShowSimple(false)}
          sx={{ mr: 2 }}
        >
          Full Test
        </Button>
        <Button
          variant={showSimple ? 'contained' : 'outlined'}
          onClick={() => setShowSimple(true)}
        >
          Simple Test
        </Button>
      </Box>

      {showSimple ? <SimpleCropTest /> : <ImageCropTest />}
    </Box>
  );
}
