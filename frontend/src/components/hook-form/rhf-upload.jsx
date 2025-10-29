import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { Upload, UploadBox, UploadAvatar } from '../upload';

// ----------------------------------------------------------------------

// NOTE: This file now supports URL-based image input previews.
// When a user pastes an image URL and clicks Use/Add, the component
// attempts to preload the image. If it loads successfully the URL is
// set into the form value (string), and existing preview components
// render it. On failure a small error message is shown.


export function RHFUploadAvatar({ name, allowUrl = false, ...other }) {
  const { control, setValue } = useFormContext();
  const [url, setUrl] = useState('');
  const [previewState, setPreviewState] = useState({ loading: false, error: null, failedUrl: null });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = (acceptedFiles) => {
          const value = acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return (
          <div>
            <UploadAvatar value={field.value} error={!!error} onDrop={onDrop} {...other} />

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
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      const trimmed = url?.trim();
                      if (!trimmed) return;
                      // try to preload image to validate
                      setPreviewState({ loading: true, error: null });
                      try {
                        await new Promise((resolve, reject) => {
                          const img = new Image();
                          img.onload = () => resolve(true);
                          img.onerror = () => reject(new Error('Image failed to load'));
                          img.src = trimmed;
                        });

                        setValue(name, trimmed, { shouldValidate: true });
                        setUrl('');
                        setPreviewState({ loading: false, error: null, failedUrl: null });
                      } catch (err) {
                        setPreviewState({ loading: false, error: 'Unable to load image from URL', failedUrl: trimmed });
                      }
                    }}
                  >
                    Use URL
                  </Button>

                  {previewState.loading && <CircularProgress size={16} />}
                  {previewState.error && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ color: 'var(--mui-palette-error-main)', fontSize: 12 }}>{previewState.error}</div>
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
              <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
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

export function RHFUploadBox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox value={field.value} error={!!error} {...other} />
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, helperText, allowUrl = false, ...other }) {
  const { control, setValue } = useFormContext();
  const [url, setUrl] = useState('');
  const [previewState, setPreviewState] = useState({ loading: false, error: null, failedUrl: null });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const uploadProps = {
          multiple,
          accept: { 'image/*': [] },
          error: !!error,
          helperText: error?.message ?? helperText,
        };

        const onDrop = (acceptedFiles) => {
          const value = multiple ? [...field.value, ...acceptedFiles] : acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return (
          <>
            <Upload {...uploadProps} value={field.value} onDrop={onDrop} {...other} />

            {allowUrl && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small"
                  label={multiple ? 'Or paste image URL (adds to list)' : 'Or paste image URL'}
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      const trimmed = url?.trim();
                      if (!trimmed) return;
                      // preload to validate
                      setPreviewState({ loading: true, error: null });
                      try {
                        await new Promise((resolve, reject) => {
                          const img = new Image();
                          img.onload = () => resolve(true);
                          img.onerror = () => reject(new Error('Image failed to load'));
                          img.src = trimmed;
                        });

                        if (multiple) {
                          const next = Array.isArray(field.value) ? [...field.value, trimmed] : [trimmed];
                          setValue(name, next, { shouldValidate: true });
                        } else {
                          setValue(name, trimmed, { shouldValidate: true });
                        }
                        setUrl('');
                        setPreviewState({ loading: false, error: null, failedUrl: null });
                      } catch (err) {
                        setPreviewState({ loading: false, error: 'Unable to load image from URL', failedUrl: trimmed });
                      }
                    }}
                  >
                    {multiple ? 'Add URL' : 'Use URL'}
                  </Button>

                  {previewState.loading && <CircularProgress size={16} />}
                  {previewState.error && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ color: 'var(--mui-palette-error-main)', fontSize: 12 }}>{previewState.error}</div>
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
          </>
        );
      }}
    />
  );
}
