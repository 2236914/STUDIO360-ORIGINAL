import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { uploadApi } from 'src/utils/api/upload';

import { supabase } from 'src/auth/context/jwt/supabaseClient';

import { Upload, UploadAvatar } from '../upload';

// ----------------------------------------------------------------------

// Enhanced upload component with Cloudinary integration
export function RHFUploadAvatar({ name, allowUrl = false, ...other }) {
  const { control, setValue } = useFormContext();
  const [url, setUrl] = useState('');
  const [previewState, setPreviewState] = useState({ loading: false, error: null, failedUrl: null });
  const [uploading, setUploading] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = async (acceptedFiles) => {
          const file = acceptedFiles[0];
          if (!file) return;

          setUploading(true);
          try {
            // Get auth token from Supabase session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.access_token) {
              throw new Error('Authentication required');
            }
            const token = session.access_token;

            // Upload to Cloudinary via backend
            const result = await uploadApi.uploadImage(file, token);
            
            if (result.success) {
              // Set the Cloudinary URL as the form value
              setValue(name, result.data.url, { shouldValidate: true });
            } else {
              throw new Error(result.message || 'Upload failed');
            }
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            // Fallback to local preview for now
            setValue(name, file, { shouldValidate: true });
          } finally {
            setUploading(false);
          }
        };

        return (
          <div>
            <UploadAvatar 
              value={field.value} 
              error={!!error} 
              onDrop={onDrop} 
              disabled={uploading}
              {...other} 
            />
            
            {uploading && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <CircularProgress size={16} />
                <FormHelperText>Uploading to Cloudinary...</FormHelperText>
              </Stack>
            )}

            {allowUrl && (
              <Stack spacing={1} sx={{ px: 2, pt: 2 }}>
                <TextField
                  size="small"
                  label="Or paste image URL"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      const trimmedUrl = url?.trim();
                      if (!trimmedUrl) return;

                      setPreviewState({ loading: true, error: null, failedUrl: null });

                      try {
                        // Test if URL is accessible
                        const img = new Image();
                        img.onload = () => {
                          setValue(name, trimmedUrl, { shouldValidate: true });
                          setUrl('');
                          setPreviewState({ loading: false, error: null, failedUrl: null });
                        };
                        img.onerror = () => {
                          setPreviewState({ 
                            loading: false, 
                            error: 'Image failed to load', 
                            failedUrl: trimmedUrl 
                          });
                        };
                        img.src = trimmedUrl;
                      } catch (err) {
                        setPreviewState({ 
                          loading: false, 
                          error: 'Invalid URL', 
                          failedUrl: trimmedUrl 
                        });
                      }
                    }}
                    disabled={!url?.trim() || previewState.loading}
                  >
                    Use URL
                  </Button>

                  {previewState.loading && <CircularProgress size={16} />}
                  {previewState.error && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ color: 'var(--mui-palette-error-main)', fontSize: 12 }}>
                        {previewState.error}
                      </div>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          const toSet = previewState.failedUrl || url?.trim();
                          if (!toSet) return;
                          setValue(name, toSet, { shouldValidate: true });
                          setUrl('');
                          setPreviewState({ loading: false, error: null, failedUrl: null });
                        }}
                      >
                        Add anyway
                      </Button>
                    </div>
                  )}
                </Stack>
              </Stack>
            )}

            {!!error && (
              <FormHelperText error sx={{ px: 2 }}>
                {error.message}
              </FormHelperText>
            )}
          </div>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, helperText, allowUrl = false, ...other }) {
  const { control, setValue } = useFormContext();
  const [url, setUrl] = useState('');
  const [previewState, setPreviewState] = useState({ loading: false, error: null, failedUrl: null });
  const [uploading, setUploading] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = async (acceptedFiles) => {
          if (!acceptedFiles || acceptedFiles.length === 0) return;

          setUploading(true);
          try {
            // Get auth token from Supabase session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.access_token) {
              throw new Error('Authentication required');
            }
            const token = session.access_token;

            if (multiple) {
              // Upload multiple images
              const result = await uploadApi.uploadMultipleImages(acceptedFiles, token);
              
              if (result.success) {
                const urls = result.data.map(item => item.url);
                const currentValue = Array.isArray(field.value) ? field.value : [];
                setValue(name, [...currentValue, ...urls], { shouldValidate: true });
              } else {
                throw new Error(result.message || 'Upload failed');
              }
            } else {
              // Upload single image
              const result = await uploadApi.uploadImage(acceptedFiles[0], token);
              
              if (result.success) {
                setValue(name, result.data.url, { shouldValidate: true });
              } else {
                throw new Error(result.message || 'Upload failed');
              }
            }
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            // Fallback to local preview for now
            if (multiple) {
              const currentValue = Array.isArray(field.value) ? field.value : [];
              setValue(name, [...currentValue, ...acceptedFiles], { shouldValidate: true });
            } else {
              setValue(name, acceptedFiles[0], { shouldValidate: true });
            }
          } finally {
            setUploading(false);
          }
        };

        const uploadProps = {
          multiple,
          accept: { 'image/*': [] },
          error: !!error,
          onDrop,
          disabled: uploading,
        };

        return (
          <>
            <Upload {...uploadProps} value={field.value} {...other} />
            
            {uploading && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <CircularProgress size={16} />
                <FormHelperText>
                  {multiple ? 'Uploading images to Cloudinary...' : 'Uploading to Cloudinary...'}
                </FormHelperText>
              </Stack>
            )}

            {allowUrl && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small"
                  label={multiple ? 'Or paste image URL (adds to list)' : 'Or paste image URL'}
                  placeholder="https://example.com/image.jpg or https://pin.it/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                
                <FormHelperText sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  💡 Pinterest URLs (pin.it) are supported and will be added directly
                </FormHelperText>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      const trimmedUrl = url?.trim();
                      if (!trimmedUrl) return;

                      setPreviewState({ loading: true, error: null, failedUrl: null });

                      try {
                        // Check if it's a Pinterest URL or other social media link
                        const isPinterestUrl = trimmedUrl.includes('pin.it') || trimmedUrl.includes('pinterest.com');
                        const isSocialMediaUrl = trimmedUrl.includes('instagram.com') || 
                                                trimmedUrl.includes('facebook.com') || 
                                                trimmedUrl.includes('twitter.com') ||
                                                trimmedUrl.includes('tiktok.com');
                        
                        if (isPinterestUrl || isSocialMediaUrl) {
                          // For social media URLs, add them directly without validation
                          if (multiple) {
                            const next = Array.isArray(field.value) ? [...field.value, trimmedUrl] : [trimmedUrl];
                            setValue(name, next, { shouldValidate: true });
                          } else {
                            setValue(name, trimmedUrl, { shouldValidate: true });
                          }
                          setUrl('');
                          setPreviewState({ loading: false, error: null, failedUrl: null });
                        } else {
                          // For direct image URLs, test if accessible
                          const img = new Image();
                          img.onload = () => {
                            if (multiple) {
                              const next = Array.isArray(field.value) ? [...field.value, trimmedUrl] : [trimmedUrl];
                              setValue(name, next, { shouldValidate: true });
                            } else {
                              setValue(name, trimmedUrl, { shouldValidate: true });
                            }
                            setUrl('');
                            setPreviewState({ loading: false, error: null, failedUrl: null });
                          };
                          img.onerror = () => {
                            setPreviewState({ 
                              loading: false, 
                              error: 'Image failed to load', 
                              failedUrl: trimmedUrl 
                            });
                          };
                          img.src = trimmedUrl;
                        }
                      } catch (err) {
                        setPreviewState({ 
                          loading: false, 
                          error: 'Invalid URL', 
                          failedUrl: trimmedUrl 
                        });
                      }
                    }}
                    disabled={!url?.trim() || previewState.loading}
                  >
                    {multiple ? 'Add URL' : 'Use URL'}
                  </Button>

                  {previewState.loading && <CircularProgress size={16} />}
                  {previewState.error && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ color: 'var(--mui-palette-error-main)', fontSize: 12 }}>
                        {previewState.error}
                      </div>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          const toSet = previewState.failedUrl || url?.trim();
                          if (!toSet) return;
                          if (multiple) {
                            const next = Array.isArray(field.value) ? [...field.value, toSet] : [toSet];
                            setValue(name, next, { shouldValidate: true });
                          } else {
                            setValue(name, toSet, { shouldValidate: true });
                          }
                          setUrl('');
                          setPreviewState({ loading: false, error: null, failedUrl: null });
                        }}
                      >
                        Add anyway
                      </Button>
                    </div>
                  )}
                </Stack>
              </Stack>
            )}

            {helperText && !error && (
              <FormHelperText sx={{ px: 2 }}>
                {helperText}
              </FormHelperText>
            )}

            {!!error && (
              <FormHelperText error sx={{ px: 2 }}>
                {error.message}
              </FormHelperText>
            )}
          </>
        );
      }}
    />
  );
}
