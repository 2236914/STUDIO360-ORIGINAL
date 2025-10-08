'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { UploadAvatar } from '../upload';
import { ImageCropModal } from './image-crop-modal';

// ----------------------------------------------------------------------

export function ImageCropTest() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [testFile, setTestFile] = useState(null);

  const handleFileSelect = (file) => {
    console.log('File selected:', file);
    setSelectedFile(file);
  };

  const handleTestCropModal = () => {
    setCropModalOpen(true);
  };

  const handleCropSave = (croppedFile) => {
    console.log('Cropped file saved:', croppedFile);
    setTestFile(croppedFile);
    setCropModalOpen(false);
  };

  const handleCropClose = () => {
    setCropModalOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Image Crop Modal Test
      </Typography>

      <Stack spacing={3}>
        {/* Upload Avatar Test */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upload Avatar with Crop (Default)
            </Typography>
            <UploadAvatar
              value={selectedFile}
              onChange={handleFileSelect}
              helperText={
                <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> Max size of 3MB
                </Typography>
              }
            />
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
                ✓ File selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Upload Avatar without Crop Test */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upload Avatar without Crop
            </Typography>
            <UploadAvatar
              value={selectedFile}
              onChange={handleFileSelect}
              enableCrop={false}
              helperText={
                <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                  Direct upload without cropping
                </Typography>
              }
            />
          </CardContent>
        </Card>

        {/* Direct Crop Modal Test */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Direct Crop Modal Test
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleTestCropModal}
              disabled={!selectedFile}
            >
              Open Crop Modal
            </Button>
            {!selectedFile && (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Please select an image first
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Test Results
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                Selected File: {selectedFile ? selectedFile.name : 'None'}
              </Typography>
              <Typography variant="body2">
                Cropped File: {testFile ? testFile.name : 'None'}
              </Typography>
              {testFile && (
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  ✓ Cropping test successful!
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Crop Modal */}
      {selectedFile && (
        <ImageCropModal
          open={cropModalOpen}
          onClose={handleCropClose}
          onSave={handleCropSave}
          imageFile={selectedFile}
          aspect={1}
          title="Test Crop Modal"
        />
      )}
    </Box>
  );
}
