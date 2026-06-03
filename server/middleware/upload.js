const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    /* Normalise all JPEG variants to .jpg so browsers display them */
    const JPEG_VARIANTS = ['.jfif', '.jpe', '.jif', '.jfif', '.pjpeg', '.pjp'];
    let ext = path.extname(file.originalname).toLowerCase();
    if (JPEG_VARIANTS.includes(ext)) ext = '.jpg';

    /* Sanitise the base name */
    const base = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-_]/g, '');

    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

/* All image formats browsers can display */
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|jfif|jpe|png|webp|gif|avif|heic|heif|bmp|tiff|tif|svg)$/i;

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/jfif',
  'image/pjpeg',
  'image/pjp',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  /* Some phones and Windows send these */
  'application/octet-stream',
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, /* 10MB — covers high-res phone photos */
  fileFilter: (req, file, cb) => {
    const extOk  = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
    const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype);

    if (extOk || mimeOk) {
      cb(null, true);
    } else {
      cb(new Error(
        `Unsupported file type: ${file.mimetype}. ` +
        'Please upload an image (JPG, PNG, WebP, GIF, AVIF, HEIC, BMP, TIFF or SVG).'
      ));
    }
  },
});

module.exports = upload;