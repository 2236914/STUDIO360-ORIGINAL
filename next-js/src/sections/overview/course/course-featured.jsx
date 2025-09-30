import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { styled, keyframes } from '@mui/material/styles';

import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { maxLine } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Label, labelClasses } from 'src/components/label';
import { Carousel, useCarousel, CarouselArrowBasicButtons } from 'src/components/carousel';

// ----------------------------------------------------------------------

// Create smooth infinite scroll animation for courses
const smoothInfiniteScroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const InfiniteScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '200%', // Double width to create seamless loop
  animation: `${smoothInfiniteScroll} 45s linear infinite`,
  '&:hover': {
    animationPlayState: 'paused', // Pause on hover for better UX
  },
}));

const ScrollItem = styled(Box)(({ theme }) => ({
  width: '50%', // Each item takes half the container width
  flexShrink: 0,
  padding: theme.spacing(0, 1.5), // Add spacing between items
}));

export function CourseFeatured({ title, list, ...other }) {
  // Duplicate the list to create seamless infinite scroll
  const duplicatedList = [...list, ...list];

  return (
    <Box {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <InfiniteScrollContainer>
          {duplicatedList.map((item, index) => (
            <ScrollItem key={`${item.id}-${index}`}>
              <CarouselItem item={item} />
            </ScrollItem>
          ))}
        </InfiniteScrollContainer>
        
        {/* Optional: Add gradient overlays for better visual effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to right, rgba(255,255,255,0.8) 0%, transparent 10%, transparent 90%, rgba(255,255,255,0.8) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </Box>
    </Box>
  );
}

function CarouselItem({ item, ...other }) {
  const theme = useTheme();

  const renderImage = (
    <Box sx={{ px: 1, pt: 1 }}>
      <Image alt={item.title} src={item.coverUrl} ratio="5/4" sx={{ borderRadius: 1.5 }} />
    </Box>
  );

  const renderLabels = (
    <Box
      sx={{
        gap: 1,
        mb: 1.5,
        display: 'flex',
        flexWrap: 'wrap',
        [`& .${labelClasses.root}`]: {
          typography: 'caption',
          color: 'text.secondary',
        },
      }}
    >
      <Label startIcon={<Iconify width={12} icon="solar:clock-circle-outline" />}>1h 40m</Label>

      <Label startIcon={<Iconify width={12} icon="solar:users-group-rounded-bold" />}>
        {fShortenNumber(item.totalStudents)}
      </Label>
    </Box>
  );

  const renderFooter = (
    <Box
      sx={{
        mt: 2.5,
        gap: 0.5,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box component="span" sx={{ typography: 'h6' }}>
        {fCurrency(item.price)}
      </Box>
      <Box component="span" sx={{ typography: 'body2', color: 'text.secondary', flexGrow: 1 }}>
        / year
      </Box>
      <Button variant="contained" size="small">
        Join
      </Button>
    </Box>
  );

  return (
    <Card sx={{ width: 1 }} {...other}>
      {renderImage}

      <Box sx={{ px: 2, py: 2.5 }}>
        {renderLabels}

        <Link
          variant="subtitle2"
          color="inherit"
          underline="none"
          sx={{ ...maxLine({ line: 2, persistent: theme.typography.subtitle2 }) }}
        >
          {item.title}
        </Link>

        {renderFooter}
      </Box>
    </Card>
  );
}
