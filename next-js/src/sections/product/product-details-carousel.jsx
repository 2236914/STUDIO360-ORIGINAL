import { useEffect } from 'react';

import Box from '@mui/material/Box';
import { styled, keyframes } from '@mui/material/styles';

import { Image } from 'src/components/image';
import { Lightbox, useLightBox } from 'src/components/lightbox';
import {
  Carousel,
  useCarousel,
  CarouselThumb,
  CarouselThumbs,
  CarouselArrowNumberButtons,
} from 'src/components/carousel';

// ----------------------------------------------------------------------

// Create smooth infinite scroll animation for product images
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
  animation: `${smoothInfiniteScroll} 40s linear infinite`,
  '&:hover': {
    animationPlayState: 'paused', // Pause on hover for better UX
  },
}));

const ScrollItem = styled(Box)(({ theme }) => ({
  width: '50%', // Each item takes half the container width
  flexShrink: 0,
  padding: theme.spacing(0, 1), // Add spacing between items
}));

export function ProductDetailsCarousel({ images }) {
  const slides = images?.map((img) => ({ src: img })) || [];
  
  // Duplicate the slides to create seamless infinite scroll
  const duplicatedSlides = [...slides, ...slides];

  const lightbox = useLightBox(slides);

  return (
    <>
      <Box sx={{ mb: 2.5, position: 'relative' }}>
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
          <InfiniteScrollContainer>
            {duplicatedSlides.map((slide, index) => (
              <ScrollItem key={`${slide.src}-${index}`}>
                <Image
                  alt={slide.src}
                  src={slide.src}
                  ratio="1/1"
                  onClick={() => lightbox.onOpen(slide.src)}
                  sx={{ 
                    cursor: 'zoom-in', 
                    minWidth: 320,
                    borderRadius: 1,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    }
                  }}
                />
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
              background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </Box>

        <CarouselThumbs
          ref={carousel.thumbs.thumbsRef}
          options={carousel.options?.thumbs}
          slotProps={{ disableMask: true }}
          sx={{ width: 360 }}
        >
          {slides.map((item, index) => (
            <CarouselThumb
              key={item.src}
              index={index}
              src={item.src}
              selected={index === carousel.thumbs.selectedIndex}
              onClick={() => carousel.thumbs.onClickThumb(index)}
            />
          ))}
        </CarouselThumbs>
      </div>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        onGetCurrentIndex={(index) => lightbox.setSelected(index)}
      />
    </>
  );
}
