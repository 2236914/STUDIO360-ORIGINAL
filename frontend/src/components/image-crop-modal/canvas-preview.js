import { centerCrop, makeAspectCrop } from 'react-image-crop';

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
export function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
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

export function canvasPreview(
  image,
  canvas,
  crop,
  scale = 1,
  rotate = 0,
  imagePosition = { x: 0, y: 0 },
) {
  console.log('canvasPreview called with:', { 
    image: !!image, 
    canvas: !!canvas, 
    crop, 
    scale, 
    rotate 
  });
  
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('No 2d context');
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload it.
  const pixelRatio = window.devicePixelRatio;
  // const pixelRatio = 1

  // ReactCrop can provide crop values in '%' when the source crop uses percent units.
  // Normalize to pixel values relative to the rendered image and then map to natural size.
  const isPercent = crop?.unit === '%';
  const cropPx = {
    x: isPercent ? (crop.x / 100) * image.width : crop.x,
    y: isPercent ? (crop.y / 100) * image.height : crop.y,
    width: isPercent ? (crop.width / 100) * image.width : crop.width,
    height: isPercent ? (crop.height / 100) * image.height : crop.height,
  };

  // If crop is invalid or zero-sized, bail early to avoid a 0x0 canvas which makes toBlob return null.
  if (!cropPx.width || !cropPx.height) {
    console.warn('canvasPreview: empty crop dimensions', crop);
    return;
  }

  canvas.width = Math.floor(cropPx.width * scaleX * pixelRatio);
  canvas.height = Math.floor(cropPx.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  // Calculate image position offset in natural image coordinates
  const imagePositionX = (imagePosition.x * scaleX) / scale;
  const imagePositionY = (imagePosition.y * scaleY) / scale;

  const cropX = (isPercent ? (crop.x / 100) * image.width : crop.x) * scaleX;
  const cropY = (isPercent ? (crop.y / 100) * image.height : crop.y) * scaleY;

  const rotateRads = rotate * (Math.PI / 180);
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 6) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 5) Apply image position offset
  ctx.translate(-imagePositionX, -imagePositionY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();
}
