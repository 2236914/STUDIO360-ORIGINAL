import Autoplay from 'embla-carousel-autoplay';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { styled, keyframes } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

import { Image } from 'src/components/image';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

// ----------------------------------------------------------------------

// Create infinite scroll animation
const infiniteScroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
`;

// Create smooth infinite scroll animation
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
  animation: `${smoothInfiniteScroll} 30s linear infinite`,
  '&:hover': {
    animationPlayState: 'paused', // Pause on hover for better UX
  },
}));

const ScrollItem = styled(Box)(({ theme }) => ({
  width: '50%', // Each item takes half the container width
  flexShrink: 0,
}));

export function AppFeatured({ list, sx, ...other }) {
  // Duplicate the list to create seamless infinite scroll
  const duplicatedList = [...list, ...list];

  return (
    <Card 
      sx={{ 
        bgcolor: 'common.black', 
        overflow: 'hidden',
        position: 'relative',
        ...sx 
      }} 
      {...other}
    >
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
          background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.8) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

function CarouselItem({ item, ...other }) {
  return (
    <Box sx={{ 
      width: 1, 
      height: { xs: 288, xl: 320 },
      position: 'relative', 
      margin: '0 8px', // Add some spacing between items
      ...other 
    }}>
      <Box
        sx={{
          p: 3,
          gap: 1,
          width: 1,
          bottom: 0,
          zIndex: 9,
          display: 'flex',
          position: 'absolute',
          color: 'common.white',
          flexDirection: 'column',
        }}
      >
        <Typography variant="overline" sx={{ color: 'primary.light' }}>
          Featured App
        </Typography>

        <Link color="inherit" underline="none" variant="h5" noWrap>
          {item.title}
        </Link>

        <Typography variant="body2" noWrap>
          {item.description}
        </Typography>
      </Box>

      <Image
        alt={item.title}
        src={item.coverUrl}
        slotProps={{
          overlay: {
            background: (theme) =>
              `linear-gradient(to bottom, ${varAlpha(theme.vars.palette.common.blackChannel, 0)} 0%, ${theme.vars.palette.common.black} 75%)`,
          },
        }}
        sx={{
          width: 1,
          height: 1,
          borderRadius: 1,
        }}
      />
    </Box>
  );
}
