import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import { canvasPreview } from './canvas-preview';
import 'react-image-crop/dist/ReactCrop.css';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropModal({ 
  open, 
  onClose, 
  onSave, 
  imageFile, 
  aspect = 1, // 1:1 for square crops (profile photos)
  title = 'Crop Image'
}) {
  console.log('ImageCropModal rendered with:', { open, imageFile, aspect, title });
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(aspect);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef('');

  const onImageLoad = useCallback((e) => {
    console.log('onImageLoad called, image dimensions:', e.currentTarget.width, e.currentTarget.height);
    // Reset image position when new image loads
    setImagePosition({ x: 0, y: 0 });
    
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      const newCrop = centerAspectCrop(width, height, aspectRatio);
      console.log('Setting crop:', newCrop);
      setCrop(newCrop);
    } else {
      // If no aspect ratio, set a default crop in the center
      const { width, height } = e.currentTarget;
      const cropSize = Math.min(width, height) * 0.8;
      setCrop({
        unit: 'px',
        x: (width - cropSize) / 2,
        y: (height - cropSize) / 2,
        width: cropSize,
        height: cropSize,
      });
    }
  }, [aspectRatio]);

  // Panning event handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'IMG') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isPanning && imgRef.current) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setImagePosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.target.tagName === 'IMG' && e.touches.length === 1) {
      setIsPanning(true);
      setLastPanPoint({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isPanning && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - lastPanPoint.x;
      const deltaY = e.touches[0].clientY - lastPanPoint.y;
      
      setImagePosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      e.preventDefault();
    }
  }, [isPanning, lastPanPoint]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const onDownloadCropClick = useCallback(() => {
    if (!previewCanvasRef.current) {
      throw new Error('Crop canvas does not exist');
    }

    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      blobUrlRef.current = URL.createObjectURL(blob);
      hiddenAnchorRef.current.href = blobUrlRef.current;
      hiddenAnchorRef.current.click();
    });
  }, []);

  const handleSave = useCallback(() => {
    console.log('handleSave called', { 
      hasCanvas: !!previewCanvasRef.current, 
      hasCrop: !!completedCrop, 
      hasImage: !!imageFile 
    });
    
    if (!previewCanvasRef.current || !completedCrop || !imageFile) {
      console.error('Missing required elements for save');
      return;
    }

    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob');
        throw new Error('Failed to create blob');
      }
      
      console.log('Blob created:', blob.size, 'bytes');
      
      // Create a new file from the cropped blob
      const croppedFile = new File([blob], imageFile.name, {
        type: blob.type,
        lastModified: Date.now(),
      });
      
      console.log('Cropped file created:', croppedFile.name, croppedFile.size);
      onSave(croppedFile);
      onClose();
    });
  }, [completedCrop, imageFile, onSave, onClose]);

  const handleClose = useCallback(() => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    setRotate(0);
    onClose();
  }, [onClose]);

  const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  console.log('Generated imageUrl:', imageUrl);

  // Cleanup object URL when component unmounts or imageFile changes
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Update canvas preview when crop or settings change
  useEffect(() => {
    if (imgRef.current && previewCanvasRef.current && completedCrop) {
      const timer = setTimeout(() => {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
          imagePosition
        );
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [completedCrop, scale, rotate, imagePosition]);

  // Add global event listeners for panning
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Image Crop Area */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {imageUrl && imageFile ? (
                <Box sx={{ position: 'relative' }}>
                  {/* Debug info */}
                  <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" display="block">
                      Debug: File={imageFile?.name}, Size={imageFile?.size}, Type={imageFile?.type}
                    </Typography>
                    <Typography variant="caption" display="block">
                      URL: {imageUrl ? imageUrl.substring(0, 50) + '...' : 'No URL'}
                    </Typography>
                    <Typography variant="caption" display="block" color={isPanning ? 'primary.main' : 'text.secondary'}>
                      Position: x={imagePosition.x}, y={imagePosition.y} {isPanning && '🎯 Panning...'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Crop: {crop ? `${Math.round(crop.x)},${Math.round(crop.y)} ${Math.round(crop.width)}x${Math.round(crop.height)}` : 'No crop'}
                    </Typography>
                  </Box>
                  
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => {
                      console.log('Crop changed:', c);
                      setCrop(c);
                    }}
                    onComplete={(c) => {
                      console.log('Crop completed:', c);
                      setCompletedCrop(c);
                    }}
                    aspect={aspectRatio}
                    minWidth={50}
                    minHeight={50}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px'
                    }}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imageUrl}
                      style={{ 
                        maxHeight: '400px', 
                        maxWidth: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        border: '2px solid #ccc',
                        cursor: isPanning ? 'grabbing' : 'grab',
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                        userSelect: 'none'
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', {
                          src: e.target.src,
                          naturalWidth: e.target.naturalWidth,
                          naturalHeight: e.target.naturalHeight,
                          width: e.target.width,
                          height: e.target.height
                        });
                        onImageLoad(e);
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', {
                          src: e.target.src,
                          error: e
                        });
                      }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleTouchStart}
                      draggable={false}
                    />
                  </ReactCrop>
                  
                  {/* Simple image test */}
                  <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                      Simple Image Test (outside ReactCrop):
                    </Typography>
                    <img
                      src={imageUrl}
                      alt="Test"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        border: '1px solid #999'
                      }}
                      onLoad={() => console.log('✅ Simple image loaded successfully')}
                      onError={() => console.error('❌ Simple image failed to load')}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: 200,
                  color: 'text.secondary',
                  border: '2px dashed #ccc',
                  borderRadius: 1
                }}>
                  <Stack spacing={1} alignItems="center">
                    <Typography>No image selected</Typography>
                    <Typography variant="caption">
                      ImageFile: {imageFile ? 'Present' : 'Missing'}
                    </Typography>
                    <Typography variant="caption">
                      ImageUrl: {imageUrl ? 'Generated' : 'Not generated'}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Controls */}
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Scale: {Math.round(scale * 100)}%
                </Typography>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Rotate: {rotate}°
                </Typography>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotate}
                  onChange={(e) => setRotate(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </Box>

              {/* Aspect Ratio Selection */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Aspect Ratio
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={aspectRatio === 1 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setAspectRatio(1)}
                  >
                    1:1 (Square)
                  </Button>
                  <Button
                    variant={aspectRatio === 16/9 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setAspectRatio(16/9)}
                  >
                    16:9
                  </Button>
                  <Button
                    variant={aspectRatio === 4/3 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setAspectRatio(4/3)}
                  >
                    4:3
                  </Button>
                  <Button
                    variant={aspectRatio === null ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setAspectRatio(null)}
                  >
                    Free
                  </Button>
                </Stack>
              </Box>

              {/* Image Position Controls */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle2">
                    Image Position
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setImagePosition({ x: 0, y: 0 })}
                    disabled={imagePosition.x === 0 && imagePosition.y === 0}
                  >
                    Reset Position
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 Tip: Drag the image to reposition it within the crop area
                </Typography>
              </Box>
            </Stack>

            {/* Preview */}
            {completedCrop && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Preview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      border: '2px solid #1976d2',
                      borderRadius: '50%',
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={onDownloadCropClick}
            variant="outlined"
            disabled={!completedCrop}
          >
            Download Preview
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!completedCrop}
          >
            Save Cropped Image
          </Button>
          {/* Debug button */}
          <Button
            onClick={() => {
              console.log('Debug info:', {
                imageFile,
                imageUrl,
                crop,
                completedCrop,
                imgRef: imgRef.current,
                previewCanvasRef: previewCanvasRef.current
              });
            }}
            variant="outlined"
            size="small"
          >
            Debug Info
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden anchor for download */}
      <a
        ref={hiddenAnchorRef}
        download
        style={{
          position: 'absolute',
          top: '-200vh',
          visibility: 'hidden',
        }}
      >
        Hidden download
      </a>

      {/* Canvas preview effect */}
      {completedCrop && (
        <canvas
          ref={previewCanvasRef}
          style={{
            position: 'absolute',
            top: '-200vh',
            visibility: 'hidden',
          }}
        />
      )}
    </>
  );
}
