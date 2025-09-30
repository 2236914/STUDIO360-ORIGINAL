import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { Upload, UploadBox, UploadAvatar } from '../upload';

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name, allowUrl = false, ...other }) {
  const { control, setValue } = useFormContext();
  const [url, setUrl] = useState('');

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
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (url?.trim()) {
                      setValue(name, url.trim(), { shouldValidate: true });
                      setUrl('');
                    }
                  }}
                >
                  Use URL
                </Button>
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
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const trimmed = url?.trim();
                    if (!trimmed) return;
                    if (multiple) {
                      const next = Array.isArray(field.value) ? [...field.value, trimmed] : [trimmed];
                      setValue(name, next, { shouldValidate: true });
                    } else {
                      setValue(name, trimmed, { shouldValidate: true });
                    }
                    setUrl('');
                  }}
                >
                  {multiple ? 'Add URL' : 'Use URL'}
                </Button>
              </Stack>
            )}
          </>
        );
      }}
    />
  );
}