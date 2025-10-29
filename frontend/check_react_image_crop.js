try {
  const m = require('./node_modules/react-image-crop');
  console.log('react-image-crop loaded:', Object.keys(m).slice(0,10));
  console.log('centerCrop', typeof m.centerCrop);
  console.log('makeAspectCrop', typeof m.makeAspectCrop);
} catch (e) {
  console.error('error requiring react-image-crop:', e && e.message ? e.message : e);
  process.exit(1);
}
