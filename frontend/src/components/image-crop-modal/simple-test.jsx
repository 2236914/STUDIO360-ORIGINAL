'use client';

import 'react-image-crop/dist/ReactCrop.css';

import { useState } from 'react';
import ReactCrop from 'react-image-crop';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function SimpleCropTest() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [crop, setCrop] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file);
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Simple Crop Test
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </Box>

      {imageUrl && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Basic Image Test:
          </Typography>
          <img
            src={imageUrl}
            alt="Test"
            style={{
              maxWidth: '300px',
              maxHeight: '200px',
              border: '2px solid #ccc'
            }}
            onLoad={() => console.log('✅ Basic image loaded')}
            onError={() => console.error('❌ Basic image failed')}
          />
        </Box>
      )}

      {imageUrl && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            ReactCrop Test:
          </Typography>
          <ReactCrop
            crop={crop}
            onChange={(c) => {
              console.log('Crop changed:', c);
              setCrop(c);
            }}
            aspect={1}
            minWidth={50}
            minHeight={50}
            style={{
              maxWidth: '400px',
              maxHeight: '300px'
            }}
          >
            <img
              src={imageUrl}
              alt="Crop test"
              style={{
                maxWidth: '400px',
                maxHeight: '300px',
                border: '2px solid #999'
              }}
              onLoad={() => console.log('✅ ReactCrop image loaded')}
              onError={() => console.error('❌ ReactCrop image failed')}
            />
          </ReactCrop>
        </Box>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100' }}>
        <Typography variant="body2">
          Debug Info:
        </Typography>
        <Typography variant="caption" display="block">
          File: {imageFile?.name || 'None'}
        </Typography>
        <Typography variant="caption" display="block">
          URL: {imageUrl ? 'Generated' : 'None'}
        </Typography>
        <Typography variant="caption" display="block">
          Crop: {crop ? `${Math.round(crop.x)},${Math.round(crop.y)} ${Math.round(crop.width)}x${Math.round(crop.height)}` : 'None'}
        </Typography>
      </Box>
    </Box>
  );
}
