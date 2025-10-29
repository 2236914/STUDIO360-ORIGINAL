import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';

import { Block } from './styles';

// ----------------------------------------------------------------------

export function BorderRadiusOptions({ value, options, onClickOption }) {
  return (
    <Block title="Border Radius">
      <Box component="ul" gap={1.5} display="grid" gridTemplateColumns="repeat(4, 1fr)">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Box component="li" key={option.value} sx={{ display: 'inline-flex' }}>
              <ButtonBase
                disableRipple
                onClick={() => onClickOption(option.value)}
                sx={{
                  py: 2,
                  px: 1,
                  width: 1,
                  gap: 0.5,
                  borderWidth: 1,
                  borderRadius: 1.5,
                  borderStyle: 'solid',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderColor: 'transparent',
                  fontSize: (theme) => theme.typography.pxToRem(11),
                  color: (theme) => theme.vars.palette.text.disabled,
                  ...(selected && {
                    color: (theme) => theme.vars.palette.text.primary,
                    borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                    boxShadow: (theme) =>
                      `-4px 4px 12px -2px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                  }),
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: `${option.value}px`,
                      bgcolor: (theme) => 
                        selected 
                          ? theme.vars.palette.primary.main
                          : varAlpha(theme.vars.palette.grey['500Channel'], 0.4),
                      transition: (theme) => theme.transitions.create(['background-color', 'border-radius'], {
                        duration: theme.transitions.duration.shorter,
                      }),
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ fontWeight: selected ? 600 : 400 }}>
                  {option.label}
                </Typography>
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Block>
  );
}

